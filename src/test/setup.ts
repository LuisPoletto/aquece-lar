import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// Os serviços simulam 250 ms por chamada; com a máquina ocupada, várias em
// sequência passam do 1 s padrão do findBy/waitFor e o teste falha à toa.
configure({ asyncUtilTimeout: 4000 });

afterEach(() => {
  cleanup();
});

// O jsdom não implementa o modal do <dialog> nem a rolagem; o Modal e o Combobox usam os dois.
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
}
if (typeof HTMLDialogElement.prototype.close !== 'function') {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
