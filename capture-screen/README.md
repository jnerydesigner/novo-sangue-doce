# Leitura de prints Sibionics

## Instalação

Além das dependências Python, instale o mecanismo OCR Tesseract:

```bash
# Ubuntu/Debian
sudo apt install tesseract-ocr tesseract-ocr-por
python3 -m pip install -r capture-screen/requirements.txt
```

## Uso

```bash
python3 capture-screen/ler_sibionics.py \
  "capture-screen/WhatsApp Image 2026-08-10 at 13.12.40.jpeg"
```

Sem `--saida`, o JSON é salvo automaticamente em `capture-screen/out/`, usando o timestamp do nome do print, por exemplo `sibionics_20260810_131240.json`.

O JSON inclui a leitura atual em mg/dL, a data, o horário estimado pelo ponto mais recente do gráfico, a confiança dessa estimativa, o timestamp do nome do arquivo do WhatsApp (apenas informativo), o `horario_envio`, os horários encontrados, todas as leituras reconhecidas e o texto bruto do OCR.

Quando o app estiver pronto, poderá informar o horário real do envio:

```bash
python3 capture-screen/ler_sibionics.py imagem.jpeg \
  --horario-envio 2026-08-10T13:22:15-04:00
```
