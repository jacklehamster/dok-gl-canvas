export function clearRecord<T>(record: Record<string, T>, clean?: (elem: T) => void) {
    Object.entries(record).forEach(([key, elem]) => {
        clean?.(elem);
        delete record[key];
    });
}
