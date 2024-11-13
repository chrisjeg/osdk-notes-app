import React from "react";

export const useStateWithDependency = (
  initialValue: string,
  dependency: string
) => {
  const [value, setValue] = React.useState(initialValue);
  React.useEffect(() => {
    setValue(initialValue);
  }, [dependency]);
  return [value, setValue] as const;
};
