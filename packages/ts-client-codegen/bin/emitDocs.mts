import { TsdocBuilder } from '../src/codegen/TsdocBuilder.mjs';

const b = new TsdocBuilder()
  .summary('This is a nice API.')
  .remarks('This API returns the invoice for a number and date.')
  .param('invoiceNumber', 'string', 'The invoice number.')
  .param('invoiceDate', 'string', 'The invoice date.')
  .returns('The invoice object.')
  .asTsDoc();

  console.log(b);