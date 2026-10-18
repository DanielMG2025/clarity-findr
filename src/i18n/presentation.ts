import { cloneElement, createElement, Fragment, forwardRef, isValidElement, type ElementType, type ReactNode } from "react";
import { useLanguage } from "./LanguageContext";

// Localization happens inside React, never by mutating DOM nodes owned by React.
// Only display text is localized. Form values, IDs, URLs, events and records pass through unchanged.
const tags = new Map<string, ElementType>();
const excluded = new Set(["script", "style", "code", "pre"]);

function textChildren(children: ReactNode, t: (text: string) => string): ReactNode {
  if (typeof children === "string") return t(children);
  if (Array.isArray(children)) return children.map(child => textChildren(child, t));
  if (isValidElement<{ children?: ReactNode }>(children) && children.type === Fragment) {
    return cloneElement(children, {}, textChildren(children.props.children, t));
  }
  return children;
}

function LocalizedText({ text }: { text: string }) {
  const { t } = useLanguage();
  return t(text);
}

// Design-system controls and router links render inside dependencies.
// Localize their string children without changing any non-display props.
export function presentationProps(type: ElementType, input: unknown) {
  if (typeof input !== "object" || input === null) return input;
  const props = input as Record<string, unknown>;
  if (typeof type !== "object" || !type) return props;
  if (!("render" in (type as object))) return props;
  const localize = (child: ReactNode): ReactNode => typeof child === "string"
    ? createElement(LocalizedText, { text: child })
    : Array.isArray(child) ? child.map(localize) : child;
  return { ...props, children: localize(props.children as ReactNode) };
}

export function presentationType(type: ElementType): ElementType {
  if (typeof type !== "string" || excluded.has(type)) return type;
  const cached = tags.get(type);
  if (cached) return cached;
  const LocalizedElement = forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
    const { t } = useLanguage();
    const localized = { ...props };
    for (const attribute of ["placeholder", "title", "aria-label", "alt"]) {
      if (typeof props[attribute] === "string") localized[attribute] = t(props[attribute]);
    }
    localized.children = textChildren(props.children as ReactNode, t);
    return createElement(type, { ...localized, ref });
  });
  LocalizedElement.displayName = `Localized(${type})`;
  tags.set(type, LocalizedElement);
  return LocalizedElement;
}