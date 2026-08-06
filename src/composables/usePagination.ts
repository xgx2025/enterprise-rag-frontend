import { reactive, computed } from 'vue'

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export function usePagination(defaultPageSize = 10) {
  const state = reactive<PaginationState>({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
  })

  const offset = computed(() => (state.page - 1) * state.pageSize)

  function onPageChange(page: number) {
    state.page = page
  }

  function onPageSizeChange(size: number) {
    state.pageSize = size
    state.page = 1
  }

  function setTotal(total: number) {
    state.total = total
  }

  function reset() {
    state.page = 1
    state.pageSize = defaultPageSize
    state.total = 0
  }

  return {
    state,
    offset,
    onPageChange,
    onPageSizeChange,
    setTotal,
    reset,
  }
}
