/// <reference lib="dom" />

/**
 * Finds the first element within the specified node (or its descendants) that has the given attribute.
 * The search stops as soon as an element with the attribute is found, and that element is returned.
 * If no such element is found, the function returns null.
 *
 * @param node - The node to start the search from.
 * @param attributeName - The name of the attribute to look for.
 * @returns The first element with the specified attribute, or null if no such element is found.
 */
export function findFirstWithAttribute(node: Node | DocumentFragment, attributeName: string): Element | null {
  if (node instanceof HTMLElement && node.hasAttribute(attributeName)) {
    return node;
  }
  
  for (const child of Array.from(node.childNodes)) {
    const found = findFirstWithAttribute(child, attributeName);
    if (found) return found;
  }

  return null;
}

/**
 * Finds all elements within the immediate children of the specified node that have the given attribute.
 * For each immediate child, the search goes into its descendants but stops as soon as an element with the attribute is found.
 * All such elements from the immediate children are collected and returned in an array.
 *
 * @param node - The node to start the search from.
 * @param attributeName - The name of the attribute to look for.
 * @returns An array of elements that have the specified attribute, one from each immediate child of the node.
 */
export function findAllWithAttribute(node: Node | DocumentFragment, attributeName: string): Element[] {
  const elements: Element[] = [];

  for (const child of Array.from(node.childNodes)) {
    const found = findFirstWithAttribute(child, attributeName);
    if (found) elements.push(found);
  }

  return elements;
}
