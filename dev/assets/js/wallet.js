class WalletManager {
    constructor() {
        this.wallet = null;
        this.gameMode = null;
        // Ждем загрузки DOM перед инициализацией
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
        });
    }

    initializeUI() {
        // Находим элементы формы
        const nickForm = document.getElementById('nick').parentElement;
        if (nickForm) {
            nickForm.style.display = 'none';
        }

        // Создаем и добавляем HTML для выбора режима
        const gameModeHTML = `
            <div class="form-group" id="gameModeSelect">
                <div class="mode-options">
                    <button type="button" id="airdropMode" class="mode-button">
                        Play with Wallet
                    </button>
                    <button type="button" id="funMode" class="mode-button">
                        Play for Fun
                    </button>
                </div>
                <div id="walletInfo">
                    <span class="wallet-address" id="walletAddress"></span>
                    <button type="button" id="disconnectWallet" class="btn btn-sm btn-danger">Disconnect</button>
                </div>
            </div>
        `;

        // Добавляем элементы в DOM
        const title = document.getElementById('title');
        if (title) {
            title.insertAdjacentHTML('afterend', gameModeHTML);
        }

        // Теперь добавляем обработчики событий
        document.getElementById('airdropMode')?.addEventListener('click', async () => {
            try {
                await this.connectWallet();
            } catch (error) {
                alert('Please install Phantom wallet');
                return;
            }
        });

        document.getElementById('funMode')?.addEventListener('click', () => {
            this.setGameMode('fun');
        });

        document.getElementById('disconnectWallet')?.addEventListener('click', () => {
            this.disconnectWallet();
        });
    }

    // ... остальные методы остаются без изменений ...
}

// Инициализируем менеджер кошелька только после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
});