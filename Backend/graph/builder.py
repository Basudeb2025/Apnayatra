from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

from graph.nodes import (
    call_model,
    execute_tool,
    human_review,
    route_after_human,
    route_after_model,
    save_memory,
)
from graph.state import AgentState


def build_graph(checkpointer=None):
    """
    Query -> call_model (node1: choose tool)
              -> save_memory -> [end]                     (final answer, no tool needed)
              -> human_review (node2: only for booking/cancel)
                    -> call_model                          (rejected)
                    -> execute_tool                         (approved)
              -> execute_tool (node3: run tool, for everything else)
                    -> call_model                          (loop back for final answer)

    Two separate memory mechanisms are in play here:
      - checkpointer (MemorySaver): short-term, thread-scoped graph state.
        Required for human_review's `interrupt()` to pause/resume mid-run.
        Swap for a Postgres/Redis checkpointer when you deploy.
      - mem0 (graph/memory.py, used inside call_model / save_memory):
        long-term, cross-session memory of facts about a given user_id,
        independent of thread_id.
    """
    graph = StateGraph(AgentState)

    graph.add_node("call_model", call_model)
    graph.add_node("human_review", human_review)
    graph.add_node("execute_tool", execute_tool)
    graph.add_node("save_memory", save_memory)

    graph.set_entry_point("call_model")

    graph.add_conditional_edges(
        "call_model",
        route_after_model,
        {
            "end": "save_memory",
            "human_review": "human_review",
            "execute_tool": "execute_tool",
        },
    )

    graph.add_conditional_edges(
        "human_review",
        route_after_human,
        {
            "call_model": "call_model",
            "execute_tool": "execute_tool",
        },
    )

    graph.add_edge("execute_tool", "call_model")
    graph.add_edge("save_memory", END)

    if checkpointer is None:
        checkpointer = MemorySaver()

    return graph.compile(checkpointer=checkpointer)
