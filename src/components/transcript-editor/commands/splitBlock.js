import { TextSelection, NodeSelection } from "prosemirror-state";
import { canSplit } from "prosemirror-transform";
import { Fragment } from "prosemirror-model";

export function splitBlockAfterWord(state, dispatch) {
  let { $from, $to } = state.selection;
  if ($to.textOffset === 0) {
    // already at boundary
  } else if ($to.nodeAfter !== null) {
    $to = state.doc.resolve($to.pos + $to.nodeAfter.nodeSize);
  } else {
    $to = state.doc.resolve($to.pos + 2);
  }
  $from = $to;

  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false;
    if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView());
    return true;
  }
  if (!$from.parent.isBlock) return false;

  if (dispatch) {
    const atEnd = $to.parentOffset === $to.parent.content.size;
    const tr = state.tr;
    const deflt =
      $from.depth === 0
        ? null
        : $from.node(-1).contentMatchAt($from.indexAfter(-1)).defaultType;
    let types = atEnd && deflt ? [{ type: deflt }] : null;
    let can = canSplit(tr.doc, $from.pos, 1, types);
    if (
      !types &&
      !can &&
      canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{ type: deflt }])
    ) {
      types = [{ type: deflt }];
      can = true;
    }
    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (
        !atEnd &&
        !$from.parentOffset &&
        $from.parent.type !== deflt &&
        $from
          .node(-1)
          .canReplace(
            $from.index(-1),
            $from.indexAfter(-1),
            Fragment.from(deflt.create(), $from.parent),
          )
      ) {
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
      }
    }
    dispatch(
      tr
        .setSelection(new TextSelection(tr.doc.resolve($to.pos + 2)))
        .scrollIntoView(),
    );
  }
  return true;
}
