import {
  ApplyActionOptions,
  ActionReturnTypeForOptions,
  ApplyBatchActionOptions,
  ActionDefinition,
  ActionEditResponse,
} from "@osdk/api";
import { client } from "../client";
import { TagDescription } from "@reduxjs/toolkit/query";

interface ActionSignatures<Params> {
  applyAction<P extends Params, OP extends ApplyActionOptions>(
    args: P,
    options?: OP
  ): Promise<ActionReturnTypeForOptions<OP>>;
  batchApplyAction<
    P extends ReadonlyArray<Params>,
    OP extends ApplyBatchActionOptions
  >(
    args: P,
    options?: OP
  ): Promise<ActionReturnTypeForOptions<OP>>;
}

/**
 * Provides a list of tags that need to be invalidated after an action is performed.
 * Errs on the side of invalidating too much rather than too little.
 * 
 * @param actionEditResponse 
 * @returns 
 */
export const getInvalidatedTagsForActionResult = <TagTypes>(
  actionEditResponse: ActionEditResponse | undefined
): ReadonlyArray<TagDescription<TagTypes>> => {
  const tags: Array<TagDescription<TagTypes>> = [];
  if (actionEditResponse == null) {
    return tags;
  }
  actionEditResponse.addedObjects?.forEach((result) => {
    tags.push({ type: result.objectType as TagTypes, id: result.primaryKey });
  });
  actionEditResponse.modifiedObjects?.forEach((result) => {
    tags.push({ type: result.objectType as TagTypes, id: result.primaryKey });
  });
  // If objects were deleted, we have no idea what we need to invalidate so we just invalidate everything affected
  if (
    actionEditResponse.deletedObjectsCount != null &&
    actionEditResponse.deletedObjectsCount > 0
  ) {
    tags.push(
      ...(actionEditResponse.editedObjectTypes.map(
        (e) => e.toString() as TagTypes
      ) ?? [])
    );
  }
  return tags;
};

/**
 * OSDK objects have circular references that can't be serialized, so we need to
 * reserialize them before storing them in the Redux store.
 * 
 * @param data The object to serialize
 */
export const serializeObject = <T>(data: T): T =>
  JSON.parse(JSON.stringify(data));

/**
 * Create a Redux action query that can be used with `createApi`.
 * 
 * @param action The OSDK action to call
 */
export function createActionQuery<T>(
  action: ActionDefinition<ActionSignatures<T>>
) {
  return async (params: T) => {
    try {
      const result = await client(action).applyAction(params, {
        $returnEdits: true,
      });
      return { data: result };
    } catch (error) {
      return { error };
    }
  };
}
