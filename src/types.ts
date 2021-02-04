export type JSONError = {
  status: number;
  code: string;
  title: string;
  detail: string;
  source?: {
    pointer: string;
    parameter?: string | number;
  };
};
