import { jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";
import { presentationType, presentationProps } from "./presentation";
export { Fragment } from "react/jsx-runtime";
export const jsx: typeof reactJsx = (type, props, key) => reactJsx(presentationType(type), presentationProps(type, props), key);
export const jsxs: typeof reactJsxs = (type, props, key) => reactJsxs(presentationType(type), presentationProps(type, props), key);