import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

interface IOption<TModel> {
  model?: TModel;
  isArray?: boolean;
  isPager?: boolean;
}

export const ApiSuccessResponse = <TModel extends Type>(
  options: IOption<TModel> = {},
) => {
  const { model, isArray, isPager } = options;
  let items: any = { type: 'null', default: null };
  if (model) {
    items = { $ref: getSchemaPath(model) };
  }

  let data: any = items;
  if (isArray) {
    data = {
      type: 'array',
      description: '返回数据',
      items: items,
    };
  }
  if (isPager) {
    data = {
      type: 'object',
      description: '返回数据',
      properties: {
        list: {
          type: 'array',
          description: '当前页面数据',
          items: items,
        },
        count: {
          type: 'number',
          description: '总记录数',
        },
      },
    };
  }
  return ApiOkResponse(
    Object.assign(
      {},
      {
        schema: {
          allOf: [
            {
              properties: {
                status: {
                  type: 'number',
                  description: '状态码',
                },
                message: {
                  type: 'string',
                  description: '提示信息',
                },
                data: data,
              },
            },
          ],
        },
      },
    ),
  );
};
