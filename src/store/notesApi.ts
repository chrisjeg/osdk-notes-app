import {
  createApi,
  QueryReturnValue,
} from "@reduxjs/toolkit/query/react";
import { client } from "../client";
import {
  createNote,
  deleteNote,
  editNote,
  Note,
  noteLookup,
} from "@jegs-sick-note-app/sdk";
import { Draft, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { createActionQuery, getInvalidatedTagsForActionResult, serializeObject } from "./ontologyReduxHelpers";

export const notesApi = createApi({
  reducerPath: "notesApi",
  baseQuery: () => ({ data: {} }),
  tagTypes: [Note.apiName],
  endpoints: (builder) => {
    const updateNotes = (
      dispatch: ThunkDispatch<any, any, UnknownAction>,
      updateRecipe: (draft: Draft<Note.Props[]>) => void
    ) => {
      return dispatch(
        notesApi.util.updateQueryData(Note.apiName, undefined, updateRecipe)
      );
    };
    return {
      [Note.apiName]: builder.query({
        queryFn: async (
          $nextPageToken?: string
        ): Promise<QueryReturnValue<Note.Props[]>> =>
          client(Note)
            .fetchPageWithErrors({
              $orderBy: {
                lastModified: "desc",
              },
              $pageSize: 100,
              $nextPageToken,
            })
            .then((response) =>
              response.error != null
                ? {
                    error: response.error,
                  }
                : {
                    data: serializeObject(response.value.data),
                  }
            ),
        providesTags: (result) =>
          result?.map(({ uuid }) => ({ type: Note.apiName, id: uuid })) ?? [],
      }),
      [noteLookup.apiName]: builder.query({
        queryFn: async (
          query: string
        ): Promise<QueryReturnValue<noteLookup.ReturnType>> =>
          client(noteLookup)
            .executeFunction({
              query,
            })
            .then((response) => ({
              data: serializeObject(response),
            })),
        providesTags: [Note.apiName],
      }),
      createNote: builder.mutation({
        queryFn: createActionQuery<createNote.Params>(createNote),
        onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
          const { data } = await queryFulfilled;
          updateNotes(dispatch, (draft) => {
            if (data?.type === "edits") {
              draft.unshift(
                ...(data?.addedObjects.map((note) => ({
                  uuid: `${note.primaryKey}`,
                  content: args.content,
                  lastModified: new Date().toISOString(),
                })) ?? [])
              );
            }
          });
        },
        invalidatesTags: getInvalidatedTagsForActionResult,
      }),
      editNote: builder.mutation({
        queryFn: createActionQuery<editNote.Params>(editNote),
        onQueryStarted: async (args, { dispatch }) => {
          updateNotes(dispatch, (draft) => {
            const index = draft.findIndex((note) => note.uuid === args.Note);
            if (index !== -1) {
              draft[index] = {
                ...draft[index],
                content: args.content,
                lastModified: new Date().toISOString(),
              };
            }
          });
        },
        invalidatesTags: getInvalidatedTagsForActionResult,
      }),
      deleteNote: builder.mutation({
        queryFn: createActionQuery<deleteNote.Params>(deleteNote),
        onQueryStarted: async (args, { dispatch }) => {
          updateNotes(dispatch, (draft) => {
            const index = draft.findIndex((note) => note.uuid === args.Note);
            if (index !== -1) {
              draft.splice(index, 1);
            }
          });
        },
        invalidatesTags: getInvalidatedTagsForActionResult,
      }),
    };
  },
});



export const {
  useNoteQuery,
  useCreateNoteMutation,
  useEditNoteMutation,
  useDeleteNoteMutation,
  useLazyNoteLookupQuery,
} = notesApi;
