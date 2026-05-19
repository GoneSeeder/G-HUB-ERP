declare module 'xlsx' {
  export type WorkBook = {
    SheetNames: string[];
    Sheets: Record<string, unknown>;
  };

  export const utils: {
    sheet_to_json<T = unknown>(
      sheet: unknown,
      options?: Record<string, unknown>,
    ): T[];
  };

  export const SSF: {
    parse_date_code(
      value: number,
    ): { y: number; m: number; d: number } | null | undefined;
  };

  export function read(data: unknown, options?: Record<string, unknown>): WorkBook;
}
