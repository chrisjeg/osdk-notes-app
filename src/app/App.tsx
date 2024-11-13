import * as React from "react";
import css from "./App.module.scss";
import {
  useCreateNoteMutation,
  useLazyNoteLookupQuery,
  useNoteQuery,
} from "../store/notesApi";
import { NoteCard } from "./NoteCard";

export const App = React.memo(() => {
  const { data: notes } = useNoteQuery(undefined);
  const [createNote, result] = useCreateNoteMutation();

  const [selectedNote, setSelectedNote] = React.useState<string | null>(null);

  const [searchNotes, searchNotesResult] = useLazyNoteLookupQuery();

  const handleKeyPress = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        searchNotes(e.currentTarget.value);
      }
    },
    []
  );
  React.useEffect(() => {
    if (searchNotesResult.data) {
      setSelectedNote(searchNotesResult.data.uuid);
    }
  }, [searchNotesResult]);

  return (
    <div className={css.takeNote}>
      <header>
        <div>Take Note 🗒️</div>
        <div className={css.actions}>
          <input
            type="search"
            placeholder="Search notes"
            onKeyDown={handleKeyPress}
            disabled={searchNotesResult.isLoading}
          />
          <button
            onClick={() => createNote({ content: "" })}
            disabled={result.isLoading}
          >
            Make note +
          </button>
        </div>
      </header>
      {searchNotesResult.data && (
        <section>{searchNotesResult.data?.answer}</section>
      )}
      <section>
        {notes?.map((data, index) => (
          <NoteCard
            tabIndex={index + 1}
            isSelected={selectedNote === data.uuid}
            setSelected={setSelectedNote}
            key={data.uuid}
            uuid={data.uuid ?? ""}
            content={data.content ?? ""}
          />
        ))}
      </section>
    </div>
  );
});
