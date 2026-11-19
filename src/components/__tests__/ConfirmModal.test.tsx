import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal Component', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="¿Eliminar?"
        message="Seguro?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza título, mensaje y botones cuando isOpen es true', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="¿Eliminar tarea?"
        message="Esta acción no se puede deshacer."
        confirmText="Confirmar"
        cancelText="Volver"
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Eliminar tarea?')).toBeInTheDocument();
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Volver' });
    fireEvent.click(cancelBtn);
    expect(onCancelMock).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
    fireEvent.click(confirmBtn);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });
});

