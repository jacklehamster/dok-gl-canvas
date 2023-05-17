import { renderHook } from '@testing-library/react-hooks'
import { useDataProvider } from './data-provider';

describe('', () => {
    it("calc results in proper calculation", () => {
        const { result } = renderHook(useDataProvider)
        const { calc } = result.current;
        expect(calc(5).valueOf()).toEqual(5);
        expect(calc("5 + 1").valueOf()).toEqual(6);
        expect(calc({ formula: "5 + 1" }).valueOf()).toEqual(6);
    });

    it("calcBuffer results in proper calculation", () => {
        const { result } = renderHook(useDataProvider)
        const { calcBuffer } = result.current;
        expect(calcBuffer([5]).valueOf()).toEqual(new Float32Array([5]));
        expect(calcBuffer(["5 - 4", 2, { formula: "1 + 2" }]).valueOf()).toEqual(new Float32Array([1, 2, 3]));
    });
});
