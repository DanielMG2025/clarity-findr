import { jsxDEV as reactJsxDEV } from "react/jsx-dev-runtime";
import { presentationType, presentationProps } from "./presentation";
export { Fragment } from "react/jsx-dev-runtime";
export const jsxDEV: typeof reactJsxDEV = (type, props, key, isStaticChildren, source, self) =>
  reactJsxDEV(presentationType(type), presentationProps(type, props), key, isStaticChildren, source, self);