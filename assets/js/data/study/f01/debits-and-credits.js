// debits-and-credits.js — F01 · Debits, credits and normal balances. Content only; exercises are in debits-and-credits.ex.js.
const MARCH_CASH_DR = [20000, 10000, 2400, 1500, 3000];                 // m1, m2, m6, m9, m12
const MARCH_CASH_CR = [4000, 1800, 350, 1000, 1600, 1200, 300];          // m3, m4, m7, m10, m11, m13, m14
const add = (a) => a.reduce((s, v) => s + v, 0);

const T_FIGURE = `<svg viewBox="0 0 480 190" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
<text x="240" y="26" text-anchor="middle" font-size="17" font-weight="600" fill="currentColor">Cash</text>
<line x1="40" y1="40" x2="440" y2="40" stroke="currentColor" stroke-width="2.5"/>
<line x1="240" y1="40" x2="240" y2="178" stroke="currentColor" stroke-width="2.5"/>
<text x="140" y="66" text-anchor="middle" font-size="15" font-weight="600" fill="var(--series-1)">Debit (Dr)</text>
<text x="140" y="86" text-anchor="middle" font-size="13" fill="var(--ink-3)">the left side</text>
<text x="340" y="66" text-anchor="middle" font-size="15" font-weight="600" fill="var(--series-2)">Credit (Cr)</text>
<text x="340" y="86" text-anchor="middle" font-size="13" fill="var(--ink-3)">the right side</text>
<text x="64" y="124" font-size="14" fill="currentColor">1 Mar</text>
<text x="216" y="124" text-anchor="end" font-size="14" fill="currentColor">20,000</text>
<text x="64" y="150" font-size="14" fill="currentColor">1 Mar</text>
<text x="216" y="150" text-anchor="end" font-size="14" fill="currentColor">10,000</text>
<text x="264" y="124" font-size="14" fill="currentColor">3 Mar</text>
<text x="416" y="124" text-anchor="end" font-size="14" fill="currentColor">4,000</text>
<text x="264" y="150" font-size="14" fill="currentColor">4 Mar</text>
<text x="416" y="150" text-anchor="end" font-size="14" fill="currentColor">1,800</text>
</svg>`;

const RULES_FIGURE = `<svg viewBox="0 0 660 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
<g fill="currentColor" font-size="15" font-weight="600" text-anchor="middle">
<text x="110" y="28">Assets</text><text x="325" y="28">Liabilities</text><text x="540" y="28">Equity</text>
<text x="315" y="182">Dividends</text><text x="445" y="182">Expenses</text><text x="575" y="182">Revenue</text>
</g>
<g fill="currentColor" font-size="26" text-anchor="middle"><text x="217" y="90">=</text><text x="432" y="90">+</text></g>
<g stroke="currentColor" stroke-width="2.2">
<line x1="20" y1="40" x2="200" y2="40"/><line x1="110" y1="40" x2="110" y2="122"/>
<line x1="235" y1="40" x2="415" y2="40"/><line x1="325" y1="40" x2="325" y2="122"/>
<line x1="450" y1="40" x2="630" y2="40"/><line x1="540" y1="40" x2="540" y2="122"/>
<line x1="255" y1="192" x2="375" y2="192"/><line x1="315" y1="192" x2="315" y2="268"/>
<line x1="385" y1="192" x2="505" y2="192"/><line x1="445" y1="192" x2="445" y2="268"/>
<line x1="515" y1="192" x2="635" y2="192"/><line x1="575" y1="192" x2="575" y2="268"/>
</g>
<g stroke="var(--rule-strong)" stroke-width="1.5" fill="none">
<polyline points="540,126 540,150"/><polyline points="315,164 315,150 575,150 575,164"/><polyline points="445,150 445,164"/>
</g>
<g fill="var(--ink-3)" font-size="12" text-anchor="middle">
<text x="65" y="60">Dr</text><text x="155" y="60">Cr</text><text x="280" y="60">Dr</text><text x="370" y="60">Cr</text><text x="495" y="60">Dr</text><text x="585" y="60">Cr</text>
<text x="285" y="210">Dr</text><text x="345" y="210">Cr</text><text x="415" y="210">Dr</text><text x="475" y="210">Cr</text><text x="545" y="210">Dr</text><text x="605" y="210">Cr</text>
<text x="65" y="114">increase</text><text x="155" y="114">decrease</text><text x="280" y="114">decrease</text><text x="370" y="114">increase</text><text x="495" y="114">decrease</text><text x="585" y="114">increase</text>
<text x="285" y="260">increase</text><text x="345" y="260">decrease</text><text x="415" y="260">increase</text><text x="475" y="260">decrease</text><text x="545" y="260">decrease</text><text x="605" y="260">increase</text>
<text x="380" y="290">reduce equity</text><text x="575" y="290">increases equity</text>
</g>
<g fill="currentColor" font-size="24" text-anchor="middle">
<text x="65" y="94">+</text><text x="155" y="94">−</text><text x="280" y="94">−</text><text x="370" y="94">+</text><text x="495" y="94">−</text><text x="585" y="94">+</text>
<text x="285" y="242">+</text><text x="345" y="242">−</text><text x="415" y="242">+</text><text x="475" y="242">−</text><text x="545" y="242">−</text><text x="605" y="242">+</text>
</g>
<g fill="currentColor" font-size="13">
<text x="20" y="200">Inside equity:</text><text x="20" y="220">revenue raises it;</text><text x="20" y="240">expenses and</text><text x="20" y="260">dividends lower it.</text>
</g>
</svg>`;

export default {
  slug: 'debits-and-credits',
  title: 'Debits, credits and normal balances',
  blurb: 'Debit means the left side of an account and credit means the right, nothing more. Work out from the accounting equation which side increases each kind of account, read normal balances, and calculate the balance of any T-account.',
  status: 'draft',
  objectives: [
    'Explain what debit and credit mean in bookkeeping, and why neither means good or bad.',
    'Explain, from the accounting equation, why each kind of account increases on the side it does.',
    'State the normal balance of assets, liabilities, equity, revenue, expenses, dividends and contra-asset accounts.',
    'Calculate the balance of a T-account, and find a missing figure from the other three.',
    'Interpret a bank statement’s debits and credits from the bank’s point of view.',
  ],
  prerequisites: [
    { lesson: 'f01/accounting-equation', why: 'The debit and credit rules are worked out from Assets = Liabilities + Equity and its expanded form.' },
    { lesson: 'f01/accounts-and-classifications', why: 'You need to recognise each account as an asset, liability, equity, revenue or expense account.' },
    { text: 'Adding columns of numbers and solving a one-step equation such as 600 + 2,100 − x = 750.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'By 15 March Lantern has made nine transactions touching twelve accounts, and Ana has been recording them the way you did in the last lesson: a spreadsheet with a column for every account and a plus or minus sign for each change. It already sprawls. To see how much cash Lantern has, she adds a column of mixed signs, and a single minus typed as a plus is easy to make and hard to find. Her accountant suggests the method merchants have used for more than five hundred years: give every account two sides, one for increases and one for decreases, and fix in advance which side each kind of change goes on. Then every amount is entered as a positive number, and one quick test catches a whole class of mistakes.' },
    { h: 'An account with two sides' },
    { p: 'An <g>account</g> collects every increase and decrease in one item, such as Cash or Accounts Payable. When accountants sketch an account by hand they draw it as a large letter T, called a <g>T-account</g>: the account’s name sits on the crossbar, and the vertical stroke divides the space below into a left side and a right side.' },
    { p: 'The left side is the <g>debit</g> side and the right side is the <g>credit</g> side. To <i>debit</i> an account means to enter an amount on its left; to <i>credit</i> an account means to enter an amount on its right. The words are often shortened to Dr and Cr. That is the whole of their meaning in bookkeeping: they name directions, the way port and starboard name the left and right of a ship.' },
    { figure: {
      svg: T_FIGURE,
      caption: 'A T-account for Lantern’s Cash with its first four cash movements. Amounts on the left are debits; amounts on the right are credits.',
      alt: 'A T-account drawn as a large letter T with the title Cash on the crossbar. The left side is labelled debit (Dr) and holds two entries dated 1 March, of 20,000 and 10,000. The right side is labelled credit (Cr) and holds 4,000 dated 3 March and 1,800 dated 4 March.',
    } },
    { p: 'The words come from Latin: <i>debit</i> from <i>debitum</i>, “something owed”, and <i>credit</i> from <i>creditum</i>, from <i>credere</i>, “to trust or entrust”. Centuries of use have worn those meanings away. In the accounts a debit is not a debt, a loss or bad news, and a credit is not income or good news. Whether a debit makes an account bigger or smaller depends entirely on what kind of account it is, and that is what the rest of this lesson works out.' },
    { h: 'Which side records an increase?' },
    { p: 'The rule for each kind of account comes straight from the accounting equation. Write it with the resources on the left and the claims on the right:' },
    { math: String.raw`\underbrace{\text{Assets}}_{\text{left}} = \underbrace{\text{Liabilities} + \text{Equity}}_{\text{right}}` },
    { p: 'The convention is that each account increases on the side where it sits in the equation. Assets are on the left, so an asset increases with a debit and decreases with a credit. Liabilities and equity are on the right, so they increase with a credit and decrease with a debit. When Ana invests $20,000, Cash (an asset) rises, so Cash is debited $20,000; Common Stock (equity) rises, so Common Stock is credited $20,000. One debit, one credit, equal amounts.' },
    { p: 'This choice is what makes the system work. Every transaction must keep the equation balanced, and with this convention a transaction keeps it balanced exactly when the amounts entered on the left of accounts equal the amounts entered on the right. So every transaction is recorded in at least two accounts with equal debits and credits. That is <g>double-entry bookkeeping</g>, and its rule, that debits equal credits, is the accounting equation in a bookkeeper’s form. The short proof is in the next part of the lesson.' },
    { h: 'Revenue, expenses and dividends' },
    { p: 'Revenue, expenses and dividends have accounts of their own, but in the expanded accounting equation all three live inside equity. Ask what each one does to equity and its rule follows:' },
    { list: [
      '<b>Revenue</b> increases equity. Equity increases with a credit, so revenue accounts increase with a credit. When Lantern invoices Meridian Partners $4,200 for catering, Catering Revenue is credited $4,200.',
      '<b>Expenses</b> decrease equity. Equity decreases with a debit, so an expense account grows with debits: it adds up the cost used up, and the bigger it gets, the further equity has fallen. When Lantern pays $1,600 of wages, Wages Expense is debited $1,600.',
      '<b>Dividends</b> also decrease equity, so the Dividends account grows with debits, even though dividends are not an expense. Lantern’s $300 dividend is a debit to Dividends.',
    ] },
    { p: 'You can see all of the rules at once by moving expenses and dividends to the other side of the expanded equation, so that nothing is subtracted:' },
    { math: String.raw`\begin{aligned} &\text{Assets} + \text{Expenses} + \text{Dividends} \\ &\quad = \text{Liabilities} + \text{Common Stock} + \text{Retained Earnings} + \text{Revenue} \end{aligned}` },
    { p: 'Every kind of account on the left of this version increases with a debit; every kind on the right increases with a credit. Some students remember it as DEA–LER: <b>d</b>ividends, <b>e</b>xpenses and <b>a</b>ssets on the debit side; <b>l</b>iabilities, <b>e</b>quity and <b>r</b>evenue on the credit side. The mnemonic is a convenience; the equation is the reason.' },
    { figure: {
      svg: RULES_FIGURE,
      caption: 'The rules drawn on the equation. Each kind of account increases on the side where it sits; revenue, expenses and dividends follow from what they do to equity.',
      alt: 'Diagram of the accounting equation drawn as three T-accounts: Assets equals Liabilities plus Equity. Assets show plus (increase) on the debit side and minus (decrease) on the credit side. Liabilities and Equity show minus on the debit side and plus on the credit side. Below Equity are three smaller T-accounts. Dividends and Expenses, labelled as reducing equity, increase on the debit side and decrease on the credit side. Revenue, labelled as increasing equity, decreases on the debit side and increases on the credit side.',
    } },
    { table: {
      caption: 'The debit and credit rules for each kind of account',
      head: ['Kind of account', 'Increase', 'Decrease', 'Normal balance', 'Lantern examples'],
      align: ['l', 'l', 'l', 'l', 'l'],
      rows: [
        ['Asset', 'Debit', 'Credit', 'Debit', 'Cash, Supplies, Equipment'],
        ['Contra-asset', 'Credit', 'Debit', 'Credit', 'Accumulated Depreciation—Equipment'],
        ['Liability', 'Credit', 'Debit', 'Credit', 'Accounts Payable, Unearned Revenue'],
        ['Equity', 'Credit', 'Debit', 'Credit', 'Common Stock, Retained Earnings'],
        ['Revenue', 'Credit', 'Debit', 'Credit', 'Catering Revenue, Training Revenue'],
        ['Expense', 'Debit', 'Credit', 'Debit', 'Wages Expense, Rent Expense'],
        ['Dividends', 'Debit', 'Credit', 'Debit', 'Dividends'],
      ],
      note: 'Contra-asset accounts reduce an asset, so they take the opposite rules; they are explained in the next part.',
    } },
    { h: 'Balances and normal balances' },
    { p: 'An <g>account balance</g> is the difference between an account’s total debits and its total credits, and it sits on the side with the larger total. Increases go on one fixed side, and most accounts can’t fall below zero, so their increases add up to at least as much as their decreases. The balance therefore usually sits on the increase side, which is called the account’s <g>normal balance</g>. Assets, expenses and dividends have normal debit balances; liabilities, equity and revenue have normal credit balances.' },
    { p: 'Here are Lantern’s accounts after its first six transactions, 1–8 March. Read each entry against the rules. On 3 March Equipment, an asset, rose by $12,000: a debit. Cash, an asset, fell by $4,000: a credit. Accounts Payable, a liability, rose by $8,000: a credit. That entry has one debit of $12,000 and two credits that add up to $12,000.' },
    { taccounts: {
      caption: 'Lantern’s accounts after 1–8 March (fictional). Each balance is shown on the account’s normal side.',
      accounts: [
        { name: 'Cash', dr: [['1 Mar', 20000], ['1 Mar', 10000], ['8 Mar', 2400]], cr: [['3 Mar', 4000], ['4 Mar', 1800]] },
        { name: 'Supplies', dr: [['5 Mar', 1500]], cr: [] },
        { name: 'Prepaid Insurance', dr: [['4 Mar', 1800]], cr: [] },
        { name: 'Equipment', dr: [['3 Mar', 12000]], cr: [] },
        { name: 'Accounts Payable', dr: [], cr: [['3 Mar', 8000], ['5 Mar', 1500]] },
        { name: 'Unearned Revenue', dr: [], cr: [['8 Mar', 2400]] },
        { name: 'Notes Payable', dr: [], cr: [['1 Mar', 10000]] },
        { name: 'Common Stock', dr: [], cr: [['1 Mar', 20000]] },
      ],
    } },
    { p: 'Add the debit balances: <m>26{,}600 + 1{,}500 + 1{,}800 + 12{,}000 = 41{,}900</m>. Add the credit balances: <m>9{,}500 + 2{,}400 + 10{,}000 + 20{,}000 = 41{,}900</m>. They agree, and they match lesson 3, where assets of $41,900 equalled liabilities of $21,900 plus equity of $20,000 after the same six transactions.' },
    { h: 'Why your bank statement looks backwards' },
    { p: 'When Harbor Tech’s $2,400 deposit reaches Lantern’s bank account on 8 March, Lantern debits Cash. Lantern’s bank statement, though, lists the same $2,400 as a <i>credit</i>. When Lantern pays its $350 advertising bill from the account, Lantern credits Cash, while the statement shows a <i>debit</i>. People who first meet these words on their own bank statements often learn the rules exactly backwards.' },
    { p: 'Nothing is wrong: the statement is written from the bank’s side. The money in Lantern’s account is money the bank owes Lantern. To the bank, a customer’s deposit is a liability, an IOU it must repay. When the deposit arrives, the bank’s liability to Lantern rises, and a liability increases with a credit, so the bank credits Lantern’s account. When Lantern spends, the bank owes it less, so the bank debits the account, which is what happens every time you pay with a debit card. A loan works the same way in reverse: Lantern’s $10,000 note is a liability in Lantern’s books and an asset, a loan it expects to be repaid, in Coastline Bank’s.' },
    { callout: 'key', title: 'Debit means left, nothing more', html: 'A debit is not an expense and a credit is not income. A debit to Cash is money coming in; a credit to Cash is money going out. Before deciding whether a debit is good or bad news, ask which account it is in and whose books you are reading.' },
  ],

  theory: [
    { h: 'Why debits must equal credits' },
    { p: 'The rule that each entry’s debits equal its credits isn’t a separate law of bookkeeping. It follows from the equation and the side convention. Every transaction keeps the equation in balance, so the changes it causes satisfy' },
    { math: String.raw`\Delta\,\text{Assets} = \Delta\,\text{Liabilities} + \Delta\,\text{Equity}` },
    { p: 'Under the convention, the change in an asset account is its debits minus its credits, while the change in a liability or equity account is its credits minus its debits. Write <m>D</m> for the debits a transaction enters in a group of accounts and <m>C</m> for its credits, with <m>A</m>, <m>L</m> and <m>E</m> for assets, liabilities and equity (revenue, expenses and dividends count as equity here). Substituting:' },
    { math: String.raw`D_A - C_A = (C_L - D_L) + (C_E - D_E)` },
    { p: 'Move every debit to the left and every credit to the right:' },
    { math: String.raw`D_A + D_L + D_E = C_A + C_L + C_E` },
    { p: 'The left-hand side is all the debits in the transaction and the right-hand side is all its credits. So a transaction keeps the equation balanced if, and only if, its debits equal its credits. Three consequences follow.' },
    { list: [
      '<b>Equal amounts, not equal lines.</b> An entry can have one debit and two credits, as Lantern’s equipment purchase did, or any other mix. Only the totals must match.',
      '<b>All the balances agree too.</b> If every entry balances, the total of all debit balances equals the total of all credit balances at any moment. After all fifteen March transactions, Lantern’s debit balances add up to $46,860 and so do its credit balances. Lesson 7 builds the trial balance on this fact.',
      '<b>Signs would work as well.</b> Store debits as positive numbers and credits as negative ones and every balanced entry adds up to zero. You will often meet this form in spreadsheets and in exports from accounting systems, where credit balances appear with minus signs. Before its month-end adjustments, Lantern’s Catering Revenue would show as −4,200: a credit balance of $4,200, not negative revenue.',
    ] },
    { h: 'Calculating an account balance' },
    { p: 'To find a balance, total each side, subtract the smaller total from the larger, and write the difference on the side of the larger total. If the account began the period with a balance, include it as the first amount on its side. Here is Lantern’s Cash account for the whole of March:' },
    { taccounts: {
      caption: 'Lantern’s Cash account for March 2026 (fictional)',
      accounts: [
        { name: 'Cash',
          dr: [['1 Mar', 20000], ['1 Mar', 10000], ['8 Mar', 2400], ['15 Mar', 1500], ['25 Mar', 3000]],
          cr: [['3 Mar', 4000], ['4 Mar', 1800], ['10 Mar', 350], ['18 Mar', 1000], ['20 Mar', 1600], ['28 Mar', 1200], ['30 Mar', 300]] },
      ],
    } },
    { p: 'Debits: <m>20{,}000 + 10{,}000 + 2{,}400 + 1{,}500 + 3{,}000 = 36{,}900</m>. Credits: <m>4{,}000 + 1{,}800 + 350 + 1{,}000 + 1{,}600 + 1{,}200 + 300 = 10{,}250</m>. Balance: <m>36{,}900 - 10{,}250 = 26{,}650</m>, a debit balance, as an asset should have. The account has seven credit entries and only five debit entries: the balance follows the larger <i>total</i>, not the side with more entries.' },
    { p: 'For an account with a normal debit balance, the ending balance is the beginning balance plus debits minus credits; for a normal credit balance, it is the beginning balance plus credits minus debits. Both say the same thing: start with what was there, add the increases and take away the decreases. Because the relationship has four parts, you can find any one of them from the other three, which is useful when a figure is missing.' },
    { h: 'Normal and abnormal balances' },
    { p: 'A balance on the side opposite the normal balance is called an abnormal balance. It is the first thing an experienced bookkeeper looks for, because most of the time it means an error: an amount entered on the wrong side, or in the wrong account. Some accounts can never have one. Supplies with a credit balance would mean Lantern held less than no coffee; Accumulated Depreciation with a debit balance would mean the equipment had been used up by less than nothing.' },
    { p: 'Other accounts can have an abnormal balance for a real reason, and then the balance tells you something:' },
    { list: [
      '<b>Cash with a credit balance</b>: the bank account is overdrawn, so the business owes its bank money. That is a liability, not an asset.',
      '<b>Accounts Receivable with a credit balance</b>: a customer has paid more than it owed, so the business owes the customer.',
      '<b>Retained Earnings with a debit balance</b>: the losses since the business began have been larger than its profits. A debit balance in retained earnings is called a deficit, and young companies often have one.',
    ] },
    { h: 'Contra accounts' },
    { p: 'A <g>contra account</g> is linked to another account and reduces it, so it takes the opposite normal balance. Lantern’s first one appears at the end of March. Its equipment cost $12,000 and is expected to last five years, and in lesson 9 you will record March’s depreciation of $200, the share of the cost used up in the month. Lantern won’t credit the Equipment account. It will credit Accumulated Depreciation—Equipment, a contra-asset account that grows with credits and has a normal credit balance:' },
    { taccounts: {
      caption: 'Equipment and its contra account after the 31 March adjustment you will record in lesson 9 (fictional)',
      accounts: [
        { name: 'Equipment', dr: [['3 Mar', 12000]], cr: [] },
        { name: 'Accumulated Depreciation—Equipment', dr: [], cr: [['31 Mar', 200]] },
      ],
    } },
    { p: 'The balance sheet shows the two together: equipment at its cost of $12,000, less accumulated depreciation of $200, a carrying amount (book value) of $11,800. Keeping the cost and the used-up part in separate accounts preserves both numbers, while crediting Equipment directly would lose the original cost. Other contra accounts work the same way, and you will meet them in later courses: an allowance for doubtful accounts reduces receivables and has a normal credit balance; sales returns reduce revenue and have a normal debit balance; treasury stock reduces equity and has a normal debit balance. Some textbooks call Dividends a contra-equity account for the same reason.' },
    { callout: 'standards', title: 'A convention, not a reporting standard', html: 'US GAAP and IFRS set out what the financial statements must report; the debit and credit rules in this lesson are bookkeeping conventions and are the same under both. What changes between frameworks and countries is the vocabulary: an IFRS or UK reporter may write share capital for common stock, trade payables for accounts payable and trade receivables for accounts receivable.' },
    { callout: 'note', title: 'Sole proprietors', html: 'In a business owned by one person without incorporating, an owner’s capital account takes the place of Common Stock and Retained Earnings, and withdrawals (drawings) take the place of Dividends. The rules don’t change: capital increases with a credit, and withdrawals reduce equity, so they increase with a debit.' },
    { h: 'Where double entry came from' },
    { p: 'Double entry grew up among the merchants of late-medieval Italy. Its first printed description appeared in Venice in 1494, in the <i>Summa de arithmetica, geometria, proportioni et proportionalita</i> of Luca Pacioli, a Franciscan friar and mathematician. Pacioli didn’t invent the method: he set out a practice merchants already used, including recording debits on the left and credits on the right so that each transaction balances. A handwritten bookkeeping manual of 1475 by Marino de Raphaeli, which shows how the method was taught in Venice, is older still (Sangster, 2015). More than five centuries on, the core of the method, equal debits and credits for every transaction, is unchanged.' },
  ],

  formulas: [
    { id: 'debit-normal-balance', name: 'Balance of an account with a normal debit balance',
      tex: String.raw`\text{Ending balance} = \text{Beginning balance} + \textstyle\sum \text{Debits} - \sum \text{Credits}`,
      where: [
        [String.raw`\text{Beginning balance}`, 'The balance brought forward from the previous period (zero for a new account)', '$'],
        [String.raw`\textstyle\sum \text{Debits}`, 'Total of the amounts entered on the left side during the period', '$'],
        [String.raw`\textstyle\sum \text{Credits}`, 'Total of the amounts entered on the right side during the period', '$'],
      ],
      assumptions: 'For assets, expenses and dividends.',
      note: 'A negative result means the account has an abnormal (credit) balance: check for an error, an overdraft or a customer credit.' },
    { id: 'credit-normal-balance', name: 'Balance of an account with a normal credit balance',
      tex: String.raw`\text{Ending balance} = \text{Beginning balance} + \textstyle\sum \text{Credits} - \sum \text{Debits}`,
      where: [
        [String.raw`\text{Beginning balance}`, 'The credit balance brought forward from the previous period', '$'],
        [String.raw`\textstyle\sum \text{Credits}`, 'Total amounts entered on the right side (increases) during the period', '$'],
        [String.raw`\textstyle\sum \text{Debits}`, 'Total amounts entered on the left side (decreases) during the period', '$'],
      ],
      assumptions: 'For liabilities, equity, revenue and contra-asset accounts.',
      note: 'Any one of the four amounts can be found from the other three.' },
    { id: 'double-entry-rule', name: 'The double-entry rule',
      tex: String.raw`\textstyle\sum \text{Debits} = \sum \text{Credits}`,
      where: [
        [String.raw`\textstyle\sum \text{Debits}`, 'Total of the amounts debited in an entry', '$'],
        [String.raw`\textstyle\sum \text{Credits}`, 'Total of the amounts credited in the same entry', '$'],
      ],
      assumptions: 'Holds for every entry, and therefore for all entries together.',
      note: 'Equivalent to keeping Assets = Liabilities + Equity in balance after every transaction.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s Accounts Payable at 31 March', fictional: true,
      setup: 'Four of Lantern’s March transactions touched Accounts Payable: it bought equipment, owing the supplier $8,000 (3 March); bought supplies on account for $1,500 (5 March); paid $1,000 of the supplies bill (18 March); and received a $260 utilities bill to pay in April (31 March). Enter them in a T-account and find the balance.',
      steps: [
        'Classify the account. Accounts Payable is a liability, so it increases with a credit and decreases with a debit, and its normal balance is a credit.',
        'Place each entry. The three new debts, $8,000, $1,500 and $260, are increases: credits. The $1,000 payment reduces the debt: a debit.',
        'Total each side. Credits: <m>8{,}000 + 1{,}500 + 260 = 9{,}760</m>. Debits: <m>1{,}000</m>.',
        'Find the balance: <m>9{,}760 - 1{,}000 = 8{,}760</m>, on the credit side because the credit total is larger.',
        'Check that it makes sense. A liability should have a credit balance, and Lantern does owe its suppliers money at the end of March.',
      ],
      answer: 'A credit balance of $8,760.',
      interpretation: 'Lantern owes its suppliers $8,760 at 31 March: $8,000 for the espresso machine, the $500 still unpaid for supplies and the $260 utilities bill. Each part can be traced to an entry, which is what makes an account useful when someone asks what a balance consists of.' },
    { level: 'challenging', title: 'Working backwards through two T-accounts', fictional: true,
      setup: 'Fernhill Clothing, a fictional brand that sells to boutiques on 30-day credit, knows these figures for May. Accounts Receivable began the month with a debit balance of $18,400 and ended it at $21,100, and sales on credit were $52,000. Accounts Payable began with a credit balance of $9,300 and ended at $11,200, and Fernhill paid its suppliers $31,500 during the month. How much cash did Fernhill collect from customers, and how much did it buy on credit?',
      steps: [
        'Accounts Receivable is an asset. The opening balance and the new credit sales go on the debit side; collections reduce what customers owe, so they go on the credit side.',
        'Call the collections <m>x</m>. Beginning + debits − credits = ending: <m>18{,}400 + 52{,}000 - x = 21{,}100</m>, so <m>x = 18{,}400 + 52{,}000 - 21{,}100 = 49{,}300</m>.',
        'Accounts Payable is a liability. The opening balance and new purchases on credit go on the credit side; payments go on the debit side.',
        'Call the purchases <m>y</m>. Beginning + credits − debits = ending: <m>9{,}300 + y - 31{,}500 = 11{,}200</m>, so <m>y = 11{,}200 + 31{,}500 - 9{,}300 = 33{,}400</m>.',
        'Check both accounts. Receivables: debits <m>18{,}400 + 52{,}000 = 70{,}400</m>, minus credits of 49,300, leaves a debit balance of 21,100. Payables: credits <m>9{,}300 + 33{,}400 = 42{,}700</m>, minus debits of 31,500, leaves a credit balance of 11,200. Both match the closing balances.',
      ],
      answer: 'Fernhill collected $49,300 from customers and bought $33,400 on credit from suppliers.',
      interpretation: 'Collections fell $2,700 short of credit sales, so receivables grew; purchases ran $1,900 ahead of payments, so payables grew. Analysts use this reasoning to estimate cash collected when a business reports its sales and its opening and closing receivables but not its collections. A growing gap between sales and collections is an early sign that customers are paying more slowly.' },
    { level: 'applied', title: 'Reviewing an export for wrong-side balances', fictional: true,
      setup: 'Kestrel Battery Installers, a fictional company that fits home battery-storage systems, sends its accountant an extract of account balances from its bookkeeping software. The software shows debit balances as positive numbers and credit balances as negative ones: Cash 18,250; Accounts Receivable −1,200; Supplies 3,400; Accumulated Depreciation—Equipment 2,600; Unearned Revenue −9,500; Retained Earnings 12,000; Wages Expense 41,300. Before preparing the year-end statements she checks every balance against its normal side. Which balances need attention, and what should she do about each?',
      steps: [
        'Translate the signs. Positive means a debit balance and negative a credit balance, so Cash, Supplies, Accumulated Depreciation, Retained Earnings and Wages Expense have debit balances, and Accounts Receivable and Unearned Revenue have credit balances.',
        'Compare each with its normal side. Cash and Supplies (assets) and Wages Expense (an expense) should be debits, and they are. Unearned Revenue (a liability) should be a credit, and it is. Three are on the wrong side: Accounts Receivable (an asset showing a credit), Accumulated Depreciation (a contra-asset showing a debit) and Retained Earnings (equity showing a debit).',
        'Accumulated Depreciation with a $2,600 debit balance can’t be genuine. The account builds up credits as equipment is used and is reduced only when equipment is sold or scrapped, so it can fall to zero but no lower. Most likely depreciation was entered on the wrong side or a disposal was recorded twice. It must be traced and corrected.',
        'Accounts Receivable with a $1,200 credit balance may be genuine: a customer may have paid twice, or a deposit for future work may have been entered as a receipt from a customer who owed nothing. Either way Kestrel owes the money. If it is genuine it should be reported as a liability, not netted against what other customers owe.',
        'Retained Earnings with a $12,000 debit balance may also be genuine: it would mean the losses since Kestrel began exceed its profits, a deficit. She checks it against last year’s closing balance sheet; if they agree, it stands.',
      ],
      answer: 'Three balances need attention: Accumulated Depreciation (almost certainly an error, to be corrected), Accounts Receivable (to investigate and, if genuine, to report as a liability) and Retained Earnings (possibly a genuine deficit, to verify against last year).',
      interpretation: 'A few minutes with the normal-balance rules turned a list of numbers into three specific questions, ranked by how likely each is to be an error. That is how professionals use the rules: not to label debits and credits for their own sake, but to see quickly which numbers can’t be right.' },
  ],

  demo: [
    { widget: 'dc-watch', intro: 'Post Lantern’s first six transactions one at a time. Before each one, say which accounts it touches and which side each amount will land on; then watch where it goes and how each balance changes.' },
    { widget: 'dc-sides', intro: 'Now the rest of March, where revenue, expenses and dividends appear. For each transaction, choose the accounts, whether each increases or decreases, and whether it is debited or credited. Use the equation to decide, not memory.' },
    { widget: 'dc-balance', intro: 'All fifteen March transactions are posted to T-accounts. Calculate each account’s balance and say which side it is on before the widget shows it.' },
  ],

  mistakes: [
    { title: '“A debit is an expense, or bad news.”', html: 'Debit names the left side and nothing else. The largest debit Lantern made in March was $20,000 to Cash when Ana invested, which is good news by any standard. Expenses increase with debits because they reduce equity, but so do assets, for the opposite reason. Ask which account a debit is in before deciding what it means.' },
    { title: '“Debit means increase and credit means decrease.”', html: 'That is true only for assets, expenses and dividends. For liabilities, equity and revenue it is the other way round: paying the supplier $1,000 on 18 March was a <i>debit</i> to Accounts Payable, and it reduced the debt. Work from the account’s place in the equation, not from a single rule.' },
    { title: '“My bank credited my account, so I should credit Cash.”', html: 'The bank writes from its own side, where your deposit is a liability. A credit on the statement is a debit to Cash in your books, and a debit on the statement, such as a fee or a card payment, is a credit to Cash.' },
    { title: '“Accumulated depreciation is an asset, so it increases with a debit.”', html: 'A contra account takes the opposite rules from the account it reduces. Accumulated Depreciation—Equipment is listed with the assets, but it increases with a credit, has a normal credit balance and is subtracted from Equipment on the balance sheet.' },
    { title: '“The balance goes on the side with more entries.”', html: 'It goes on the side with the larger total. Lantern’s March Cash account has seven credits and five debits, but the debits total $36,900 against $10,250 of credits, so the balance is a debit of $26,650.' },
    { title: '“Every entry has one debit and one credit.”', html: 'Every entry needs at least one of each and equal totals, not equal numbers of lines. The 3 March equipment purchase has one debit of $12,000 and two credits, of $4,000 and $8,000.' },
  ],

  application: [
    { p: 'Bookkeepers read bank statements every week, and the first skill is translating them. Each credit on Lantern’s statement should match a debit to Cash in Lantern’s books, and each debit on the statement a credit to Cash; the formal comparison, called a bank reconciliation, explains any difference as either timing or error. A bookkeeper who forgets whose books a statement describes will post every bank line to the wrong side. Lantern’s healthy $26,650 of cash at the end of March would then appear as a $26,650 credit balance: an overdraft that doesn’t exist.' },
    { p: 'Controllers and auditors look for wrong-side balances early in any review, because an abnormal balance is the cheapest error signal in accounting. A credit balance in Supplies, a debit balance in Unearned Revenue or a debit in Accumulated Depreciation almost always means an entry went to the wrong side or the wrong account, and it is far cheaper to correct in the books than after the statements are published. A credit balance in Cash or Accounts Receivable is a question rather than a verdict: the business may genuinely owe its bank or a customer, and then the amount belongs with the liabilities.' },
    { p: 'Analysts meet debits and credits in signed form. A finance team that pulls a list of account balances into a spreadsheet often receives credit balances as negative numbers, so revenue, liabilities and equity arrive with minus signs while assets and expenses are positive. A complete list should then add up to zero; if it doesn’t, rows are missing or duplicated. Before building a report the analyst reverses the signs of the credit-balance accounts so that revenue reads as a positive number, and notes having done so. Skipping that step is an easy way to misread a report: a rise in revenue shows up as a larger negative number.' },
    { p: 'Finally, the rule that debits equal credits is built into the tools. Accounting software typically refuses to post an entry whose debits and credits differ, so a balanced set of books tells you little about whether the right accounts were chosen. That choice starts with the source document, and it is the subject of the next lesson: journal entries.' },
  ],

  summary: [
    'Debit means the left side of an account and credit the right. Neither means good or bad, and a debit is not an expense.',
    'Each account increases on the side where it sits in the accounting equation: assets with debits, liabilities and equity with credits.',
    'Revenue increases equity, so it increases with a credit; expenses and dividends reduce equity, so they increase with a debit. Assets + Expenses + Dividends = Liabilities + Common Stock + Retained Earnings + Revenue.',
    'Every entry’s debits equal its credits, which is the same as saying the equation stays balanced. Totals must match; numbers of lines need not.',
    'An account’s balance is the difference between its debit and credit totals, on the side of the larger total. The normal balance is the side that records increases; a balance on the other side is usually an error, and occasionally a real overdraft, customer credit or deficit.',
    'Contra accounts such as Accumulated Depreciation take the opposite normal balance to the account they reduce.',
    'Bank statements are written from the bank’s side: your deposit is the bank’s liability, so the bank credits your account when money comes in.',
  ],

  glossary: [
    { term: 'Debit', def: 'The left side of an account, or an amount entered there (abbreviated Dr). A debit increases assets, expenses and dividends and decreases liabilities, equity and revenue.' },
    { term: 'Credit', def: 'The right side of an account, or an amount entered there (abbreviated Cr). A credit increases liabilities, equity and revenue and decreases assets, expenses and dividends.' },
    { term: 'T-account', def: 'A sketch of an account shaped like a letter T, with debits to the left of the vertical line and credits to the right. Used for teaching and analysis; ledgers kept in practice use columns.' },
    { term: 'Normal balance', def: 'The side on which an account records increases, and so the side on which its balance usually sits: debit for assets, expenses and dividends; credit for liabilities, equity, revenue and contra-asset accounts.' },
    { term: 'Double-entry bookkeeping', def: 'The system of recording every transaction in at least two accounts with equal debits and credits, so that the accounting equation stays in balance.' },
    { term: 'Account balance', def: 'The difference between an account’s total debits and total credits, including any balance brought forward, stated on the side of the larger total.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 3.1, “Describe Principles, Assumptions, and Concepts of Accounting and Their Relationship to Financial Statements” (subsections on double-entry bookkeeping, debits and credits, and normal balances). OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/3-1-describe-principles-assumptions-and-concepts-of-accounting-and-their-relationship-to-financial-statements', checked: '2026-10-22' },
    { text: 'McLeay, M., Radia, A. &amp; Thomas, R. (2014). Money in the modern economy: an introduction. <i>Bank of England Quarterly Bulletin</i>, 2014 Q1. (Bank deposits as IOUs from banks to their customers; loans as assets of banks.)', url: 'https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-in-the-modern-economy-an-introduction', checked: '2026-10-22' },
    { text: 'Sangster, A. (2015). The earliest known treatise on double entry bookkeeping by Marino de Raphaeli. <i>Accounting Historians Journal</i>, 42(2), 1–33.', url: 'https://abdn.elsevierpure.com/en/publications/the-earliest-known-treatise-on-double-entry-bookkeeping-by-marino', checked: '2026-10-22' },
    { text: 'Keio University Library. Catalogue entry for Luca Pacioli, <i>Summa de arithmetica, geometria, proportioni et proportionalita</i> (Venice: Paganino de Paganini, November 1494), in <i>Incunabula and the Keio University Library Collection</i>.', url: 'https://dcollections.lib.keio.ac.jp/en/node/205702', checked: '2026-10-22' },
    { text: 'Encyclopaedia Britannica. “Luca Pacioli”.', url: 'https://www.britannica.com/biography/Luca-Pacioli', checked: '2026-10-22' },
    { text: 'Harper, D. <i>Online Etymology Dictionary</i>, entries “debit” and “credit”.', url: 'https://www.etymonline.com/word/debit', checked: '2026-10-22' },
  ],

  checks: [
    { what: 'Transactions by 15 March (m1–m9)', value: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'].length, shown: 9 },
    { what: 'Accounts touched by m1–m9', value: new Set(['Cash', 'Common Stock', 'Notes Payable', 'Equipment', 'Cash', 'Accounts Payable', 'Prepaid Insurance', 'Cash', 'Supplies', 'Accounts Payable', 'Cash', 'Unearned Revenue', 'Advertising Expense', 'Cash', 'Accounts Receivable', 'Catering Revenue', 'Cash', 'Training Revenue']).size, shown: 12 },
    { what: 'Years since 1494 (text: more than five hundred / five centuries)', value: 2026 - 1494, shown: 532 },
    { what: 'Cash after 1–8 March', value: 20000 + 10000 + 2400 - 4000 - 1800, shown: 26600 },
    { what: 'Accounts Payable after 1–8 March', value: 8000 + 1500, shown: 9500 },
    { what: 'Debit balances after 8 March', value: (20000 + 10000 + 2400 - 4000 - 1800) + 1500 + 1800 + 12000, shown: 41900 },
    { what: 'Credit balances after 8 March', value: (8000 + 1500) + 2400 + 10000 + 20000, shown: 41900 },
    { what: 'Liabilities after 8 March (lesson 3)', value: (8000 + 1500) + 2400 + 10000, shown: 21900 },
    { what: 'Equipment purchase: credits equal the debit', value: 4000 + 8000, shown: 12000 },
    { what: 'Cash debits in March', value: add(MARCH_CASH_DR), shown: 36900 },
    { what: 'Cash credits in March', value: add(MARCH_CASH_CR), shown: 10250 },
    { what: 'Cash at 31 March (agrees with MARCH_FACTS.cashEnd)', value: add(MARCH_CASH_DR) - add(MARCH_CASH_CR), shown: 26650 },
    { what: 'Number of cash debit entries', value: MARCH_CASH_DR.length, shown: 5 },
    { what: 'Number of cash credit entries', value: MARCH_CASH_CR.length, shown: 7 },
    { what: 'Unadjusted debit balances at 31 March', value: 26650 + (4200 - 3000) + 1500 + 1800 + 12000 + 300 + 350 + 1600 + 1200 + 260, shown: 46860 },
    { what: 'Unadjusted credit balances at 31 March', value: (8000 + 1500 - 1000 + 260) + 2400 + 10000 + 20000 + 4200 + 1500, shown: 46860 },
    { what: 'Catering Revenue before adjustments, signed', value: -4200, shown: -4200 },
    { what: 'Depreciation for March', value: 12000 / 5 / 12, shown: 200 },
    { what: 'Carrying amount of equipment', value: 12000 - 12000 / 5 / 12, shown: 11800 },
    { what: 'AP example: credits', value: 8000 + 1500 + 260, shown: 9760 },
    { what: 'AP example: balance', value: 8000 + 1500 + 260 - 1000, shown: 8760 },
    { what: 'AP example: still unpaid for supplies', value: 1500 - 1000, shown: 500 },
    { what: 'AP example: parts add up', value: 8000 + 500 + 260, shown: 8760 },
    { what: 'Fernhill: collections', value: 18400 + 52000 - 21100, shown: 49300 },
    { what: 'Fernhill: receivable debits', value: 18400 + 52000, shown: 70400 },
    { what: 'Fernhill: receivables check', value: 70400 - 49300, shown: 21100 },
    { what: 'Fernhill: purchases on credit', value: 11200 + 31500 - 9300, shown: 33400 },
    { what: 'Fernhill: payable credits', value: 9300 + 33400, shown: 42700 },
    { what: 'Fernhill: payables check', value: 42700 - 31500, shown: 11200 },
    { what: 'Fernhill: sales not collected', value: 52000 - 49300, shown: 2700 },
    { what: 'Fernhill: purchases not paid', value: 33400 - 31500, shown: 1900 },
    { what: 'Reversed bank postings: credit balance', value: add(MARCH_CASH_DR) - add(MARCH_CASH_CR), shown: 26650 },
  ],
};
