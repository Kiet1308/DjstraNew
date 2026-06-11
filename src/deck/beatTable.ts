/**
 * Bảng nhịp của một slide: mảng mô tả trạng thái từng beat.
 * `beats` của SlideDef LUÔN suy từ `count` — không đếm tay.
 * `at(beat)` clamp chỉ số để an toàn khi transition giữa các slide.
 */
export function defineBeats<T>(table: T[]) {
  if (table.length === 0) throw new Error('Bảng beat rỗng')
  return {
    table,
    count: table.length,
    at(beat: number): T {
      const i = Math.max(0, Math.min(table.length - 1, beat))
      return table[i]
    },
  }
}
