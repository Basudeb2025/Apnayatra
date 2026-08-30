import logging
import os

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langgraph.types import interrupt

from graph.memory import get_relevant_memories, save_turn
from graph.state import AgentState
from tools.registry import ALL_TOOLS, SENSITIVE_TOOLS, TOOLS_BY_NAME
from prompt.s_prompt import system_prompt,ROUTER_ADDENDUM


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hotel_agent")


SYSTEM_PROMPT = system_prompt


_GEMINI_MODEL_NAME = "gemini-2.5-flash"
_GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


llm = ChatGoogleGenerativeAI(model=_GEMINI_MODEL_NAME, temperature=0, google_api_key=_GOOGLE_API_KEY)
llm_with_tools = llm.bind_tools(ALL_TOOLS)

_GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "openai/gpt-oss-20b")
_GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_llm = ChatGroq(model=_GROQ_MODEL_NAME, temperature=0, groq_api_key=_GROQ_API_KEY)


@tool
def delegate_to_gemini(reason: str) -> str:
    """Call this - and ONLY this - when answering the user requires live/
    internal data or an action: hotel search or listing,hotel details
    availability or pricing, booking, cancellation, user/account lookups,
    weather lookups, or any other data you cannot know just from this
    conversation and the system prompt. Do NOT call this for general
    questions about the application itself, general knowledge about a
    location/city, greetings, or small talk - answer those yourself
    instead. `reason` should be a short (<20 word) note on what the user
    needs, purely so the next system knows what to look up.
    """
    return "delegating to gemini"


_ROUTER_ADDENDUM = ROUTER_ADDENDUM
groq_router = groq_llm.bind_tools([delegate_to_gemini])


# own phone number mid-conversation.
PHONE_AUTO_TOOLS = {"get_user_data", "hotel_booking", "cancel_booking"}

#Currently this is uselesss because groq is handeling the first coversations
def _apply_authenticated_args(name: str, args: dict, user_id: str) -> dict:
    args = dict(args or {})
    if name in PHONE_AUTO_TOOLS:
        args["user_id"] = user_id
        if not args.get("phone_number"):
            args["phone_number"] = user_id
        if name == "get_user_data":
            args["sessionkey"] = user_id
    return args


 
# node1: Groq answers directly when it can; otherwise it delegates to
# Gemini (which owns the real tools) all within this same function. No
# extra graph node is introduced - route_after_model only ever sees
# whatever message this function returns.
 
def call_model(state: AgentState, config: RunnableConfig) -> dict:
    messages = list(state["messages"])
    user_id = (config.get("configurable") or {}).get("user_id", "default_user")

    # Pull cross-session memory relevant to the latest user message and
    # fold it into the system prompt (mem0 handles the "who is this user
    # / what do we already know about them" part; the checkpointer below
    # only handles this single thread's in-flight state).
    last_human = next(
        (m for m in reversed(messages) if isinstance(m, HumanMessage)), None
    )
    memory_context = (
        get_relevant_memories(user_id, last_human.content) if last_human else ""
    )

    system_content = SYSTEM_PROMPT
    if memory_context:
        system_content += (
            "\n\nRelevant memory about this user from past conversations "
            "(names, preferences, prior context only - this is NOT live data "
            "and may be outdated):\n"
            f"{memory_context}\n\n"
            "IMPORTANT: never answer a hotel listing, hotel detail, booking, "
            "cancellation, or weather question directly from the memory "
            "above. Always call the appropriate tool to get current results, "
            "even if the memory already seems to contain an answer."
        )

    if messages and isinstance(messages[0], SystemMessage):
        messages[0] = SystemMessage(content=system_content)
    else:
        messages = [SystemMessage(content=system_content)] + messages

    # -----------------------------------------------------------------
    # Step 1: Groq router. Same message stack, but with the routing
    # addendum tacked onto the system prompt just for this call.
    # -----------------------------------------------------------------
    router_messages = list(messages)
    router_messages[0] = SystemMessage(content=system_content + _ROUTER_ADDENDUM)

    needs_gemini = False
    try:
        router_response = groq_router.invoke(router_messages)
        router_tool_calls = getattr(router_response, "tool_calls", None) or []
        needs_gemini = any(tc["name"] == "delegate_to_gemini" for tc in router_tool_calls)
    except Exception:
        logger.exception("[call_model] Groq router call failed, falling back to Gemini")
        needs_gemini = True
        router_response = None

    if not needs_gemini and router_response is not None:
        logger.info("[call_model] Groq answered directly: %r", router_response.content)
        return {"messages": [router_response]}

    # -----------------------------------------------------------------
    # Step 2: delegate to Gemini, which owns the real 8 tools and does
    # the actual ReAct tool-calling loop from here.
    # -----------------------------------------------------------------
    logger.info("[call_model] Groq delegated to Gemini")
    try:
        response = llm_with_tools.invoke(messages)
    except Exception:
        logger.exception("[call_model] Gemini call failed")
        response = AIMessage(
            content=(
                "Sorry, I had trouble putting that request together. "
                "Could you try rephrasing, or ask again?"
            )
        )

    logger.info(
        "[call_model] tool_calls=%s content=%r",
        getattr(response, "tool_calls", None),
        response.content,
    )
    return {"messages": [response]}


def route_after_model(state: AgentState) -> str:
    last = state["messages"][-1]
    tool_calls = getattr(last, "tool_calls", None)

    if not tool_calls:
        return "end"

    if any(tc["name"] in SENSITIVE_TOOLS for tc in tool_calls):
        return "human_review"

    return "execute_tool"


 
# node2: human-in-the-loop review, only reached for booking / cancellation
 
def human_review(state: AgentState, config: RunnableConfig) -> dict:
    last = state["messages"][-1]
    tool_calls = last.tool_calls
    user_id = (config.get("configurable") or {}).get("user_id", "")
    approval_lines = []
    for tc in tool_calls:
        tool_args = _apply_authenticated_args(tc["name"], tc["args"], user_id)

        if tc["name"] == "hotel_booking":
            hotel_id = tool_args.get("hotel_id", "unknown")
            customer_name = tool_args.get("customer_name", "unknown")
            number_of_rooms = tool_args.get("number_of_rooms", "1")
            user_key = tool_args.get("user_id") or user_id or "unknown"
            phone_number = tool_args.get("phone_number") or "+91_____"
            approval_lines.append(
                f"Hotel_id: {hotel_id} Customer Name={customer_name}, "
                f"Number of Rooms={number_of_rooms} Phone number: {phone_number}"
            )
        else:
            approval_lines.append(f"Run tool {tc['name']}.")

    message = "Please confirm that you would like to proceed:\n" + "\n".join(approval_lines)
    decision = interrupt(
        {
            "type": "tool_confirmation",
            "message": message,
        }
    )

    approved = False
    if isinstance(decision, dict):
        approved = bool(decision.get("approved", False))
    elif isinstance(decision, str):
        approved = decision.strip().lower() in ("approve", "approved", "yes", "y", "confirm")
    elif isinstance(decision, bool):
        approved = decision

    if approved:
        # Leave the AIMessage with tool_calls untouched -> routed to execute_tool.
        return {"messages": []}

    # Rejected: satisfy each pending tool_call with a ToolMessage so the
    # conversation stays valid, then let the model respond to the user.
    rejection_messages = [
        ToolMessage(
            content=(
                "The user did NOT approve this action. Do not perform it. "
                "Ask the user how they would like to proceed instead."
            ),
            tool_call_id=tc["id"],
            name=tc["name"],
        )
        for tc in tool_calls
    ]
    return {"messages": rejection_messages}


def route_after_human(state: AgentState) -> str:
    last = state["messages"][-1]
    # If human_review already turned the pending calls into ToolMessages
    # (rejection case), go straight back to the model. Otherwise the
    # action was approved -> go execute it.
    if isinstance(last, ToolMessage):
        return "call_model"
    return "execute_tool"



# node3: actually run the chosen tool(s)

async def execute_tool(state: AgentState, config: RunnableConfig) -> dict:
    last = state["messages"][-1]
    tool_calls = last.tool_calls
    user_id = (config.get("configurable") or {}).get("user_id", "")

    tool_messages = []
    for tc in tool_calls:
        name = tc["name"]
        args = _apply_authenticated_args(name, tc["args"], user_id)
        tool = TOOLS_BY_NAME.get(name)
        logger.info("[execute_tool] calling %s with args=%s", name, args)

        if tool is None:
            result = f"Error: tool '{name}' was not found in the registry."
            logger.warning("[execute_tool] %s", result)
        else:
            try:
                result = await tool.ainvoke(args)
                logger.info("[execute_tool] %s returned: %r", name, result)
            except Exception as exc:  # noqa: BLE001
                logger.exception("[execute_tool] %s raised an exception", name)
                result = f"Error while executing tool '{name}': {exc}"

        tool_messages.append(
            ToolMessage(content=str(result), tool_call_id=tc["id"], name=name)
        )

    return {"messages": tool_messages}


 
# runs once per turn, right before the graph ends: persist the exchange
# to mem0 (long-term, cross-session memory)
 
def _extract_text(content) -> str:
    """
    Normalize AIMessage.content into a plain string for mem0.

    Gemini (langchain_google_genai) returns .content as a list of content
    blocks (e.g. [{"type": "text", "text": "..."}, {"type": "thought_signature", ...}])
    even for a plain text reply, unlike Groq/OpenAI-style models which
    return a plain string. mem0 expects plain text, so this pulls out
    just the text parts regardless of which shape came back.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)
    return str(content) if content is not None else ""


def save_memory(state: AgentState, config: RunnableConfig) -> dict:
    user_id = (config.get("configurable") or {}).get("user_id", "default_user")
    messages = state["messages"]

    last_human = next(
        (m for m in reversed(messages) if isinstance(m, HumanMessage)), None
    )
    last_ai = messages[-1] if messages and isinstance(messages[-1], AIMessage) else None

    save_turn(
        user_id=user_id,
        human_text=_extract_text(last_human.content) if last_human else "",
        ai_text=_extract_text(last_ai.content) if last_ai else "",
    )
    return {}