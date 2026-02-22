export interface NovaIntencaoCompraDTO {
  nome: string;
  mensagem: string;
  idProduto: number;
}

export interface IntencaoCompraResponseDTO {
  id: number;
  qrCodePix: string;
}

export interface Compra {
  id: number;
  nome: string;
  mensagem: string;
  total: number;
  tipoPagamento: 'CARTAO' | 'PIX';
  dataPagamento: string;
  dataCompra: string;
  produto: {
      id: number;
      nome: string;
      descricao: string;
      linkImagem: string
  }
  statusPagamento: 'PENDENTE' | 'FINALIZADO';
}

