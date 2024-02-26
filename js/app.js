$(document).ready(function () {
    cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];

var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;

var VALOR_ENTREGA = 5;

var CELULAR_EMPRESA = '5513974235880';

cardapio.eventos = {

    init: () => {
        cardapio.metodos.obterItensCardapio();
    }

}

cardapio.metodos = {

    //Obtem a lista de itens do cardapio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {

        var filtro = MENU[categoria]

        //Limpa os itens
        if(!vermais){
            $("#itensCardapio").html('')
            $("#btnVerMais").removeClass("hidden")
        }

        $.each(filtro, (i, e) => {
            let temp = cardapio.templates.item
            .replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${id}/g, e.id)
            .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","));

            //Botao vermais foi clicado
            if(vermais && i >= 8 && i < 12){
                $("#itensCardapio").append(temp) 
            }

            //Paginacao inicial ( 8 item )
            if(!vermais && i < 8){
                $("#itensCardapio").append(temp) 
            }
        })

        //Removaer o active
        $(".container-menu a").removeClass('active')

        //Set o menu para active
        $("#menu-" + categoria).addClass("active")

        //Ocultar o btnVerMais caso a categoria tenha menos ou 8 itens
        filtro.length <= 8 ? $("#btnVerMais").addClass("hidden") : $("#btnVerMais").removeClass("hidden")
    },

    //Clique no botao de vermais
    verMais: () => {
        var ativo = $(".container-menu a.active").attr("id").split('menu-')
        cardapio.metodos.obterItensCardapio(ativo[1], true)

        $("#btnVerMais").addClass("hidden")
    },

    //Diminuir a quantidade do item no cardapio
    diminuirQuantidade: (id) => {
        let quantidadeTotal = parseInt($("#qntd-" + id).text());
        if(quantidadeTotal > 0){
            $("#qntd-" + id).text(quantidadeTotal - 1)
        }
    },

    //Aumentar a quantidade do item no cardapio
    aumentarQuantidade: (id) => {
        let quantidadeTotal = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(quantidadeTotal + 1);
    },

    //Adiciona o carrinha o item do cardapio
    adicionarAoCarrinho: (id) => {
        let quantidadeTotal = parseInt($("#qntd-" + id).text());

        if(quantidadeTotal > 0){
            //Obter a categoria ativa
            var categoria =  $(".container-menu a.active").attr("id").split('menu-')[1];

            //obtem a lista de item
            let filtro = MENU[categoria];

            //obtem o item
            let item = $.grep(filtro, (e, i) => {return e.id == id})

            if(item.length > 0){

                //validar se ja existe
                let existe = $.grep(MEU_CARRINHO, (element, index) => {return element.id == id})

                if(existe.length > 0){
                
                    let objIndex = MEU_CARRINHO.findIndex(obj => obj.id == id);
                    MEU_CARRINHO[objIndex].qntd += quantidadeTotal

                } else {
                    item[0].qntd = quantidadeTotal
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem("Item adicionado ao carrinho.", "green")

                $("#qntd-" + id).text(0)
            
                cardapio.metodos.atualizarBadgeTotal();
            }
        }
    },

    //Atualizar quantidade de BagBotoesCarrinho
    atualizarBadgeTotal: () => {

        var total = 0

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if(total > 0){
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }else{
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);
    }, 

    //Abri o carrinho ao clicar na sacola
    abrirCarrinho: (abrir) => {

        if(abrir){
            $("#modalCarrinho").removeClass("hidden");
            cardapio.metodos.carregarCarrinho();
        }else {
            $("#modalCarrinho").addClass("hidden");
        }
    },

    //Altera os textos conforme as etapas
    carregarEtapas: (etapa) => {

        if(etapa == 1){

            $("#lblTituloEtapa").text("Seu carrinho:");
            $("#itensCarrinho").removeClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");

            $("#btnEtapaPedido").removeClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").addClass("hidden");

        }else if (etapa == 2){

            $("#lblTituloEtapa").text("Endereço de entrega:");
            $("#itensCarrinho").addClass("hidden");
            $("#localEntrega").removeClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaEndereco").removeClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").removeClass("hidden");

        }else if (etapa == 3){

            $("#lblTituloEtapa").text("Resumo do pedido:");
            $("#itensCarrinho").addClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").removeClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");
            $(".etapa3").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").removeClass("hidden");
            $("#btnVoltar").removeClass("hidden");

        }
    },

    //Volta para etapa anterior
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapas(etapa - 1);

    },

    //Carrega os item no carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapas(1);

        if (MEU_CARRINHO.length > 0){

            $("#itensCarrinho").html("")

            $.each(MEU_CARRINHO, (i, e) => {
                
                let tempCarrinho = cardapio.templates.itemCarrinho 
                .replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${id}/g, e.id)
                .replace(/\${qntdCarrinho}/g, e.qntd)
                .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","));

                $("#itensCarrinho").append(tempCarrinho)

                if((i + 1) == MEU_CARRINHO.length){
                    cardapio.metodos.carregarValores();
                }
            })

        }else {
            $("#itensCarrinho").html(`<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i>Seu carrinho está vazio.</p>`)
            cardapio.metodos.carregarValores();
        }

    },

    //Adiciona o carrinha o item do cardapio, na parte das etapas
    aumentarQuantidadeCarrinho: (id) => {
        let quantidadeTotal = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(quantidadeTotal + 1);
        cardapio.metodos.atualizarCarrinho(id, quantidadeTotal + 1)
    },

    //Diminuir a quantidade do item no cardapio, na parte das etapas
    diminuirQuantidadeCarrinho: (id) => {
        let quantidadeTotal = parseInt($("#qntd-carrinho-" + id).text());

        if(quantidadeTotal > 1){
            $("#qntd-carrinho-" + id).text(quantidadeTotal - 1);
            cardapio.metodos.atualizarCarrinho(id, quantidadeTotal - 1)
        }else{
            cardapio.metodos.removerItemCarrinho(id);
        }
    },

    //Remove o item do carrinho, na parte das etapas
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {return e.id != id});
        cardapio.metodos.carregarCarrinho();
        cardapio.metodos.atualizarBadgeTotal();

    },

    //Atualizar carrinho com a quantidade total
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        cardapio.metodos.atualizarBadgeTotal();

        cardapio.metodos.carregarValores();

    },

    //Calcula o total no carrinho
    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubtotal").text("R$ 0,00")
        $("#lblValorEntrega").text("+ R$ 0,00")
        $("#lblValorTotal").text("R$ 0,00")

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.qntd * e.price);

            if((i + 1) == MEU_CARRINHO.length){
                $("#lblSubtotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`)
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`)
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`)
            }

        })
    },

    //Carrega os endereços via CEP
    carregarEnderecos: () => {

        if(MEU_CARRINHO.length <= 0){
            cardapio.metodos.mensagem("Seu carrinho está vazio.")
            return;
        }

        cardapio.metodos.carregarEtapas(2);

    },

    //Chama a api via Cep
    buscarCEP: () => {

        let cep = $("#textCEP").val().trim().replace(/\D/g, '');

        if(cep != ""){

            var validaCEP = /^[0-9]{8}$/

            if(validaCEP.test(cep)){

                $.getJSON(`https://viacep.com.br/ws/${cep}/json/?callback=?`, function (dados) {

                    if(!("erro" in dados)){

                        $("#textEndereco").val(dados.logradouro);
                        $("#textBairro").val(dados.bairro);
                        $("#textCidade").val(dados.localidade);
                        $("#ddlUF").val(dados.uf);

                        $("#textNumero").focus();

                    }else {
                        cardapio.metodos.mensagem("CEP não encontrado.Preencha as informações manualmente.")
                        $("#textEndereco").focus();
                    }
                })

            }else{
                cardapio.metodos.mensagem("Formato do CEP inválido.")
                $("#textCEP").focus();
            }
            
        }else{
            cardapio.metodos.mensagem("Informe o CEP por favor.")
            $("#textCEP").focus();
        }

    },

    //Resumo pedido
    resumoPedido: () => {

        let cep = $("#textCEP").val().trim();
        let endereco = $("#textEndereco").val().trim();
        let bairro = $("#textBairro").val().trim();
        let numero = $("#textNumero").val().trim();
        let cidade = $("#textCidade").val().trim();
        let uf = $("#ddlUF").val().trim();
        let complemento = $("#textComplemento").val().trim();

        if(cep <= 0){
            cardapio.metodos.mensagem("Informe o CEP por favor.");
            $("#textCEP").focus();
            return;
        }

        if(endereco <= 0){
            cardapio.metodos.mensagem("Informe o Endereço por favor.");
            $("#textEndereco").focus();
            return;
        }

        if(bairro <= 0){
            cardapio.metodos.mensagem("Informe o Bairro por favor.");
            $("#textBairro").focus();
            return;
        }

        if(numero <= 0){
            cardapio.metodos.mensagem("Informe o Número por favor.");
            $("#textNumero").focus();
            return;
        }

        if(cidade <= 0){
            cardapio.metodos.mensagem("Informe a Cidade por favor.");
            $("#textCEP").focus();
            return;
        }

        if(complemento <= 0){
            cardapio.metodos.mensagem("Informe o Complemento por favor.");
            $("#textComplemento").focus();
            return;
        }

        if(uf == "-1"){
            cardapio.metodos.mensagem("Selecione uma UF por favor.");
            $("#ddlUF").focus();
            return;
        }

        MEU_ENDERECO = {

            cep : cep,
            endereco : endereco,
            bairro : bairro,
            numero : numero,
            cidade : cidade,
            uf : uf,
            complemento : complemento,
        }

        cardapio.metodos.carregarEtapas(3);
        cardapio.metodos.carregarCarrinhoResumo();
    },

    //Carrega o carrinho da etapa de resumo
    carregarCarrinhoResumo: () => {

        $("#listaItensResumo").html("")

        $.each(MEU_CARRINHO, (i, e) => {
                
            let tempCarrinho = cardapio.templates.itemCarrinhoResumo 
            .replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${qntd}/g, e.qntd)
            .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","));

            $("#listaItensResumo").append(tempCarrinho)

        })

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        cardapio.metodos.finalizarPedido();

    },

    //Manda mensagem pelo whatsapp
    finalizarPedido: () => {

        if ( MEU_CARRINHO.length > 0 && MEU_ENDERECO != null){

            let text = "Olá, gostaria de fazer um pedido: ";
            text += `\n*Itens do pedido:*\n\n\${itens}`;
            text += `\n*Endereço de entrega:*`;
            text += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            text += `\n${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            text += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}*`;

            let itens = "";

            $.each(MEU_CARRINHO, (i, e) => {

                itens += `*${e.qntd} x* ${e.name} .......... R$ ${e.price.toFixed(2).replace(".", ",")}\n`

                if((i + 1) == MEU_CARRINHO.length){

                    text = text.replace(/\${itens}/g, itens);

                    console.log(text)
                    let encode = encodeURI(text);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}/?text=${encode}`
                
                    $("#btnEtapaResumo").attr('href', URL);
                }
            })
        }
    },

    //Mensagem para adicionar ao Carrinho
    mensagem: (texto, cor = "red", tempo = 3000) => {
        
        let id = Math.floor(Date.now() * Math.random).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;
        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass("fadeInDown");
            $("#msg-" + id).addClass("fadeOutUp");
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800)
        }, tempo)
        
    },
}

cardapio.templates = {

    item: `
        <div class="col-3 mb-5">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" alt="">
                </div>
                <p class="tittle-produto text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${price}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" alt="">
            </div>
            <div class="dados-produto">
                <p class="tittle-produto"><b>\${name}</b></p>
                <p class="price-produto"><b>R$ \${price}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntdCarrinho}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>
            </div>
        </div>
    `,

    itemCarrinhoResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" alt="">
            </div>
            <div class="dados-produto">
                <p class="tittle-produto-resumo">
                    <b>\${name}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${price}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
}