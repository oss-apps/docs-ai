/* eslint-disable */
import { BaseChain, LLMChain, SerializedStuffDocumentsChain } from "langchain/chains";
import { type Document } from "langchain/document";
import { type ChainValues } from "langchain/schema";

export interface StuffDocumentsChainInput {
  /** LLM Wrapper to use after formatting documents */
  inputKey: string;
  outputKey: string;
  /** Variable name in the LLM chain to put the documents in */
  documentVariableName: string;
}

/**
 * Chain that combines documents by stuffing into context.
 * @augments BaseChain
 * @augments StuffDocumentsChainInput
 */
export class StuffDocumentsChain
  extends BaseChain
  implements StuffDocumentsChainInput {

  inputKey = "input_documents";

  outputKey = "output_text";

  documentVariableName = "context";

  get inputKeys() {
    return [this.inputKey];
  }

  constructor(fields: {
    inputKey?: string;
    outputKey?: string;
    documentVariableName?: string;
  }) {
    super();
    this.documentVariableName =
      fields.documentVariableName ?? this.documentVariableName;
    this.inputKey = fields.inputKey ?? this.inputKey;
    this.outputKey = fields.outputKey ?? this.outputKey;
  }

  async _call(values: ChainValues): Promise<ChainValues> {
    if (!(this.inputKey in values)) {
      throw new Error(`Document key ${this.inputKey} not found.`);
    }
    const { [this.inputKey]: docs, ...rest } = values;
    const texts = (docs as Document[]).map(({ pageContent, metadata }) => {
      return `Content: ${pageContent}\nSource: ${metadata.source}`;
    })
    const text = texts.join("\n\n");

    return { [this.documentVariableName]: text };
  }

  serialize(): SerializedStuffDocumentsChain {
    return {
      _type: this._chainType(),
    };
  }

  _chainType() {
    return "stuff_documents_chain" as const;
  }
}



