# Smart Sangue Doce

Servico Python para centralizar rotinas de inteligencia do Sangue Doce.

## Primeiro caso de uso

Ler um print do leitor/Sibionics e devolver um contrato pronto para ingestao pelo NestJS:

```json
{
  "ok": true,
  "measurement": {
    "measuredAt": "2026-08-10T13:15:00-04:00",
    "glucoseValueMgDl": 99,
    "readingContext": "AFTER_MEAL",
    "source": "SENSOR",
    "noteType": "AFTER_LUNCH",
    "timeZone": "America/Manaus"
  },
  "evidence": {
    "currentReadingMgDl": 99,
    "date": "10/08/2026",
    "estimatedReadingTime": "13:15",
    "estimatedTimeConfidence": "media",
    "whatsappFilenameTimestamp": "2026-08-10T13:12:40",
    "sentAt": null,
    "foundTimes": ["13:15"],
    "foundReadingsMgDl": [99],
    "ocrText": "..."
  },
  "warnings": []
}
```

## Rodando local

Instale o Tesseract:

```bash
make install-smart-ocr
```

Suba a API:

```bash
make install-smart
make dev-smart
```

Sem o binario `tesseract` instalado no sistema, o endpoint de OCR responde `503` com uma mensagem de instalacao. O Dockerfile ja instala essas dependencias dentro da imagem.

Teste o endpoint:

```bash
curl -X POST http://localhost:8040/v1/measurements/read-image \
  -F "file=@../capture-screen/print.jpeg" \
  -F "time_zone=America/Manaus"
```

Healthcheck:

```bash
curl http://localhost:8040/health
```

## Docker

```bash
docker build -t smart-sangue-doce ./smart-sangue-doce
docker run --rm -p 8040:8040 smart-sangue-doce
```

## VPS / Portainer

O `docker-compose.portainer.yaml` da raiz ja registra o servico `smart` na rede interna:

```yaml
SMART_URL=http://smart:8040
SMART_IMAGE=jandernery/sangue-doce-smart:latest
```

Build e push da imagem:

```bash
docker build -t jandernery/sangue-doce-smart:latest ./smart-sangue-doce
docker push jandernery/sangue-doce-smart:latest
```

Depois atualize/recrie a stack no Portainer usando o compose da raiz. O servico nao precisa expor porta publica; o backend acessa internamente por `http://smart:8040`.

## Testes

```bash
make test-smart
```
