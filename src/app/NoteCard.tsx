import React from "react";
import { useDeleteNoteMutation, useEditNoteMutation } from "../store/notesApi";
import css from "./NoteCard.module.scss";
import { useStateWithDependency } from "../hooks/useStateWithDependency";

export const NoteCard = React.memo<{
  uuid: string;
  content: string;
  setSelected: (uuid: string | null) => void;
  isSelected: boolean;
  tabIndex: number;
}>(({ uuid, isSelected, setSelected, content, tabIndex }) => {
  const [editedContent, setEditedContent] = useStateWithDependency(
    content,
    content
  );
  const [editNote] = useEditNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  const handleSelection = React.useCallback(() => {
    setSelected(uuid);
  }, [uuid, setSelected]);

  const handleBlur = React.useCallback(() => {
    setSelected(null);
    if (content !== editedContent) {
      editNote({
        content: editedContent,
        Note: uuid,
      });
    }
  }, [content, editedContent, uuid]);

  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (isSelected && textAreaRef) {
      textAreaRef.current?.focus();
    }
  }, [isSelected]);

  const onClickDelete = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNote({
        Note: uuid,
      });
    },
    [editNote, editedContent, uuid]
  );

  return (
    <div
      tabIndex={!isSelected ? tabIndex : undefined}
      onFocus={handleSelection}
      onClick={handleSelection}
      className={css.note}
    >
      <textarea
        value={editedContent}
        tabIndex={tabIndex}
        ref={textAreaRef}
        onChange={(e) => setEditedContent(e.target.value)}
        onBlur={handleBlur}
        draggable={false}
        placeholder="Take a note…"
      />
      <div className={css.actions}>
        <button onClick={onClickDelete}>
          ⛌
        </button>
      </div>
    </div>
  );
});
