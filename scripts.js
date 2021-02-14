const Modal = {
  elements: {
    form: document.querySelector('form'),
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
  },
  open(){
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close(){
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

transactions = [
  { description: "Luz", amount: -5000, date: "29/01/2021" },
  { description: "Website", amount: 500000, date: "29/01/2021" },
  { description: "Internet", amount: -9900, date: "29/01/2021" },
  { description: "App", amount: 200000, date: "29/01/2021" },
];

const Storage = {
  getByIndex(index) {
    const transactions = this.get();
    return transactions[index];
  },
  get(){
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(transactions)
    )
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction){
    Transaction.all.push(transaction)
    App.reload()
  },
  addByIndex(transaction, index) {
    Transaction.all[index] = transaction;
    App.reload();
  },
  remove(index){
    Transaction.all.splice(index, 1)
    App.reload()
  },
  update(index){
    const { description, amount, date } = Storage.getByIndex(index);
    const [day, month, year] = date.split('/');
    Modal.open();
    Modal.elements.form.setAttribute('data-update', index);
    Modal.elements.description.value = description;
    Modal.elements.amount.value = (amount / 100).toFixed(2);
    Modal.elements.date.value = `${year}-${month}-${day}`;
  },
  income() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if(transaction.amount > 0){
        income += transaction.amount;
      }
    });
    return income;
  },
  expense() {
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if(transaction.amount < 0){
        expense += transaction.amount;
      }
    })
    return expense;
  },
  total(){
    return Transaction.income() + Transaction.expense();
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
    const amount = Utils.formatCurrency(transaction.amount)
    const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover essa transação"></td>
            <td><img onclick="Transaction.update(${index})" src="./assets/edit.svg" alt="Editar essa transação"></td>
        `
    return html
  },
  updateBalance(){
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.income()
    )
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expense()
    )
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    )
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = '';
  }
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `
      ${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}
      `;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues(){
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields(){
    const { description, amount, date } = Form.getValues()
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ){
      throw new Error('Por favor, preencha todos os campos')
    }
  },

  formatValues(){
    let { description, amount, date } = Form.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return { description, amount, date }
  },
  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },
  sumit(event) {
    event.preventDefault();
    try {
      const form = event.target;
      const indexToUpdate = form.dataset.update;

      Form.validateFields();
      const transaction = Form.formatValues();
      if (indexToUpdate !== '' && indexToUpdate !== undefined) {
        Transaction.addByIndex(transaction, indexToUpdate);
        form.removeAttribute('data-update');
      } else {
        Transaction.add(transaction);
      }
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

function DarkMode() {
  const darkSelect = document.querySelector("#chk");

  const onChangeDark = () => {
    const html = document.querySelector('html');
    const setDarkMode = html.classList.toggle("dark-mode");
    localStorage.setItem("dev.finances:mode", String(setDarkMode))
  };
  const setDarkMode = (localStorage.getItem("dev.finances:mode") || "true") === "false" ? false : true;
  if(setDarkMode) onChangeDark()

  darkSelect.addEventListener('change', onChangeDark)
}

const App = {
  init(){
    DarkMode()
    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()
    Storage.set(Transaction.all)
  },

  reload(){
    DOM.clearTransactions()
    App.init()
  },
};

App.init()