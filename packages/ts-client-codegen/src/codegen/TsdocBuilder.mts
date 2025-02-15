import { DocBlock, DocBlockTag, DocComment, DocParagraph, DocParamBlock, DocPlainText, DocSection, TSDocConfiguration, TSDocEmitter } from '@microsoft/tsdoc';

export class TsdocBuilder {
  readonly #conf: TSDocConfiguration;
  readonly #doc: DocComment;
  constructor() {
    this.#conf = new TSDocConfiguration();
    this.#doc = new DocComment({
      configuration: this.#conf,
    });
  }

  summary(text: string): TsdocBuilder {
    const para = new DocParagraph({
      configuration: this.#conf,
    });
    const txt = new DocPlainText({
      configuration: this.#conf,
      text: text
    });
    para.appendNode(txt);
    this.#doc.summarySection.appendNode(para);
    return this;
  }

  remarks(text: string): TsdocBuilder {
    const remarks = new DocBlock({
      configuration: this.#conf,
      blockTag: new DocBlockTag({
        configuration: this.#conf,
        tagName: '@remarks'
      }),
    });
    const pt = new DocPlainText({
      configuration: this.#conf,
      text: text
    });
    const para2 = new DocParagraph({
      configuration: this.#conf
    });
    para2.appendNode(pt);
    remarks.content.appendNode(para2);
    this.#doc.remarksBlock = remarks;
    return this;
  }

  param(name: string, type: string, description: string): TsdocBuilder {
    const para = new DocParagraph({
      configuration: this.#conf,
    });
    const txt = new DocPlainText({
      configuration: this.#conf,
      text: description
    });
    para.appendNode(txt);
    
    const paramBlock = new DocParamBlock({
      configuration: this.#conf,
      parameterName: name,
      blockTag: new DocBlockTag({
        configuration: this.#conf,
        tagName: '@param'
      }),
    });
    paramBlock.content.appendNode(para);
    this.#doc.params.add(paramBlock);
    return this;
  }

  throws(exType: string, description: string) {
    const para = new DocParagraph({
      configuration: this.#conf,
    });
    const txt = new DocPlainText({
      configuration: this.#conf,
      text: description
    });
    para.appendNode(txt);
    
    const paramBlock = new DocParamBlock({
      configuration: this.#conf,
      parameterName: exType,
      blockTag: new DocBlockTag({
        configuration: this.#conf,
        tagName: '@throws',
        
      }),
    });
    paramBlock.content.appendNode(para);
    this.#doc.params.add(paramBlock);
    return this;
  }

  returns(description: string): TsdocBuilder {
    const para = new DocParagraph({
      configuration: this.#conf,
    });
    const txt = new DocPlainText({
      configuration: this.#conf,
      text: description
    });
    para.appendNode(txt);
    
    const returnsBlock = new DocBlock({
      configuration: this.#conf,
      blockTag: new DocBlockTag({
        configuration: this.#conf,
        tagName: '@returns'
      }),
    });
    returnsBlock.content.appendNode(para);
    this.#doc.returnsBlock = returnsBlock;
    return this;
  }

  asTsDoc(): string {
    const output = this.#doc.emitAsTsdoc();
    const lines = output.split('\n');
    const indexes: number[] = [];
    for (let i = lines.length - 1; i > 0; i--) {
      const l = lines[i].trim();
      if (l === '*' && (i == 1 || lines[i-1].trim().startsWith('* @param'))) {
        indexes.push(i);
      }
    }
    return lines.filter((l,i) => !indexes.includes(i)).join('\n');
  }
}