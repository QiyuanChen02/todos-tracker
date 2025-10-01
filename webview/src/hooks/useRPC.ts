import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { rpcCall } from '../rpcClient';
import type { InferInput, InferOutput, Procedure, RouterDef } from "../../../src/rpcHost";
import type { AppRouter } from '../../../src/router/router';

type StringKeys<T> = Extract<keyof T, string>;

export type PathKeys<T> = {
  [K in StringKeys<T>]:
    T[K] extends Procedure<any, any>
      ? K
      : T[K] extends object
        ? `${K}.${PathKeys<T[K]>}`
        : never
}[StringKeys<T>];

export type ProcedureAtPath<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends StringKeys<T>
      ? ProcedureAtPath<T[K], Rest>
      : never
    : P extends StringKeys<T>
      ? T[P] extends Procedure<any, any> ? T[P] : never
      : never;

export type InputAtPath<R extends RouterDef, P extends PathKeys<R>> = InferInput<ProcedureAtPath<R, P>>;
export type OutputAtPath<R, P extends PathKeys<R>> = InferOutput<ProcedureAtPath<R, P>>;

export function useRPCQuery<P extends PathKeys<AppRouter>>(
  path: P,
  input: InputAtPath<AppRouter, P>,
  options?: Omit<
    UseQueryOptions<
      OutputAtPath<AppRouter, P>,
      Error,
      OutputAtPath<AppRouter, P>,
      readonly [P, InputAtPath<AppRouter, P>]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [path, input] as const,
    queryFn: () => rpcCall(path, input),
    ...options,
  });
}

export function useRPCMutation<P extends PathKeys<AppRouter>>(
  path: P,
  options?: Omit<
    UseMutationOptions<
      OutputAtPath<AppRouter, P>,
      Error,
      InputAtPath<AppRouter, P>
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (input: InputAtPath<AppRouter, P>) => rpcCall(path, input),
    ...options,
  });
}