import { Buffer } from "buffer";
import { CastFunction } from "./common";
import Types from "./types";

const TypeMapper: Record<Types, CastFunction> = {
  [Types.Integer]: Number,
  [Types.Float]: Number,
  [Types.String]: (value: any) => (value ? String(value) : null),
  [Types.Decimal]: (value: any) => (value ? String(value) : null),
  [Types.Binary]: Buffer.from,
  [Types.Boolean]: Boolean
};

export default TypeMapper;
