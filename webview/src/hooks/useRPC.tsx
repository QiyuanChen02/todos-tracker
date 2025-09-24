import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import { rpcCall } from '../rpcClient';

export function useRPCQuery<I, O>(path: string, input: I, options?: { enabled: boolean }) {
    return useQuery({
        queryKey: [path, input],
        queryFn: () => rpcCall<I, O>(path, input),
        ...options,
    })
}

export function useRPCMutation<I, O>(path: string, options?: UseMutationOptions<O, Error, I>) {
    return useMutation({
        mutationFn: (input: I) => rpcCall<I, O>(path, input),
        ...options,
    })
}