import type { Element, CheerioAPI, Document, AnyNode, Cheerio } from "cheerio"

const inlineElements = new Set(
  `a,abbr,acronym,audio,b,bdi,bdo,big,br,button,canvas,cite,code,data,
  datalist,del,dfn,em,embed,i,iframe,img,input,ins,kbd,label,map,mark,
  meter,noscript,object,output,picture,progress,q,ruby,s,samp,script,
  select,slot,small,span,strong,sub,sup,svg,template,textarea,time,
  tt,u,var,video,wbr`
    .split(",")
    .map((s) => s.trim())
)
const isBlockTag = (tagName: string) => !inlineElements.has(tagName)

export function render(
  node: CheerioAPI | Document | Element | Cheerio<Element> | undefined,
  loadImg: boolean
): string {
  let root: Document | Element | null = null
  if (typeof node === "object" && "0" in node) {
    root = node[0] ?? null
  } else if (typeof node === "object" && "children" in node && "type" in node) {
    root = node
  }

  if (!root) {
    throw new Error(
      "node was not a string, cheerio loaded document, or a cheerio node"
    )
  }

  let text = ""

  function enter(element: AnyNode) {
    if (element.type === "tag" && element.tagName === "li") {
      text += "- "
    }
    if (element.type === "text") {
      text += element.data
    }
  }

  function leave(element: AnyNode) {
    if (element.type === "tag") {
      // console.log({ LEAVING: element.type, tagName: element.tagName })
      if (isBlockTag(element.tagName)) {
        text += "\n"
      }
      if (loadImg && element.tagName === "img" && element.attribs.src) {
        text += `\n![${element.attribs.alt || ''}](${element.attribs.src})`
      }
    }
  }

  walk(root, enter, leave)

  return text
    .trim()
    .split(/\n+/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
}

function walk(
  root: AnyNode,
  enter: (element: AnyNode) => void,
  leave: (element: AnyNode) => void
) {
  enter(root)
  if (root.type === "tag") {
    for (const child of root.children) {
      walk(child, enter, leave)
    }
  }
  leave(root)
}