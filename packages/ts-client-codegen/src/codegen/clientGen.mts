import { dereference } from '@scalar/openapi-parser';
import { OpenAPIV3 } from '@scalar/openapi-types';
import { Logger } from 'tslog';
import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { GenerationContext } from './types.mts';
import { template } from './tsconfigGen.mjs';
import { TSDocParser, ParserContext } from '@microsoft/tsdoc';

const logger = new Logger({name :'clientGen'});

type Operation = OpenAPIV3.OperationObject;
type Schema = OpenAPIV3.Document;

export default async function generateClient(context: GenerationContext) {
  const project = new Project({
    tsConfigFilePath: context.outputs.tsConfig!
  });
  const sf = project.addSourceFileAtPath(context.outputs.models!);
  //const ops = extractOperations(sf.getTypes);
  await extractOperations(context.schema, sf);
}
interface OperationType {
  asdf: never;
  qwer: never;
}

function analyzeOperation(sf: SourceFile, operationName: string) {
  const opsIface = sf.getInterface('operations')!;
  const OpType = opsIface.getProperty(operationName)!.getType();;
  const reqBody = OpType.getProperty('requestBody')!.getValueDeclarationOrThrow().getType().getProperty('content')!.getValueDeclarationOrThrow().getType();
  
  const appJsonProp = reqBody.getPropertyOrThrow('application/json')!
  if (!appJsonProp.getValueDeclaration()) {
    logger.warn(`Operation ${operationName} does not have a application/json request body and will be skipped.`);
    return;
  }
  const paramParam = OpType.getProperty('parameters')!.getValueDeclarationOrThrow().getType();
  const queryParam = paramParam!.getProperty('query')!.getValueDeclarationOrThrow().getType();
  const headerParam = paramParam.getProperty('header')!.getValueDeclarationOrThrow().getType();
  const pathParam = paramParam.getProperty('path')!.getValueDeclarationOrThrow().getType();
  const cookieParam = paramParam.getProperty('cookie')!.getValueDeclarationOrThrow().getType();

  const contentType = appJsonProp.getTypeAtLocation(appJsonProp.getValueDeclarationOrThrow());
  return contentType.getText();
}

async function extractOperations(schema: Schema, sf: SourceFile): Promise<Operation[]> {
  const ds = await dereference(schema);
  return Object.entries(schema.paths!).map(([path, pathItem]) => {
    return Object.entries(pathItem!).map(([method, operation]) => {
      const op = operation as Operation;
      if (!op.operationId) {
        logger.warn(`Operation at ${path}:${method} does not have an operationId and will be skipped.`);
        return null;
      }
      let reqBdy;
      if (op.requestBody) {
        
      }
      const analysis = analyzeOperation(sf, op.operationId);
      return {
        operationId: op.operationId,
        path: path,
        method: method,
        summary: op.summary!,
        description: op.description!,
        request: {
          contentType: '',
          body: '',
          query: '',
          header: ''
        }
      } satisfies OperationDescription;
    });
  }).flatMap(opgroup => opgroup).filter(a => a !== null);
}

interface OperationDescription {
  operationId: string;
  path: string;
  method: string;
  summary: string;
  description: string;
  request: RequestDescription
}
interface RequestDescription {
  contentType: string;
  body: string;
  query: string;
  header: string;
}
interface ParameterDescription {
  name: string;
  type: string;
  in: 'query' | 'header' | 'path' | 'cookie';
}
