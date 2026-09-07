# IA Sangue Doce

Espaco para notebooks e experimentos de mapeamento de relatorios em XLSX.

## Como usar

1. Crie o ambiente virtual:

```bash
cd ia-sangue-doce
python3 -m venv .venv
source .venv/bin/activate
```

2. Instale as dependencias:

```bash
pip install -r requirements.txt
```

3. Registre o ambiente como kernel do Jupyter:

```bash
python -m ipykernel install --user --name ia-sangue-doce --display-name "IA Sangue Doce"
```

4. Coloque os arquivos `.xlsx` em `data/raw/`.

5. Abra o notebook:

```bash
jupyter lab notebooks/mapeamento_relatorios_xlsx.ipynb
```

No VS Code, selecione o kernel `IA Sangue Doce` no canto superior direito do notebook.

O fluxo inicial do notebook ajuda a inspecionar abas, colunas e amostras dos arquivos antes de definir o mapeamento final.
