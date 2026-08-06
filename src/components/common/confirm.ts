import { ElMessageBox } from 'element-plus'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

export async function showConfirm(opts: ConfirmOptions): Promise<boolean> {
  try {
    await ElMessageBox.confirm(opts.message, opts.title || '确认操作', {
      confirmButtonText: opts.confirmText || '确定',
      cancelButtonText: opts.cancelText || '取消',
      type: opts.type || 'warning',
    } as any)
    return true
  } catch {
    return false
  }
}
