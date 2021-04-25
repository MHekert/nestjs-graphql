import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsBase64, IsEnum, IsInt, IsOptional, Max } from 'class-validator';
import { OrderEnum } from '../enums/order.enum';

registerEnumType(OrderEnum, {
  name: 'OrderEnum',
});

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    defaultValue: 20,
    nullable: true,
  })
  @IsInt()
  @Max(100)
  limit?: number = 20;

  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsBase64()
  cursor?: string;

  @Field(() => OrderEnum, {
    defaultValue: OrderEnum.DESC,
    nullable: true,
  })
  @IsEnum(OrderEnum)
  order?: OrderEnum = OrderEnum.DESC;
}
