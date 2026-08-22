# Detalhes dos achados

## 1. Processamento global de imagens sem autenticação

### Fluxo

1. `POST /foods/images/process-all` entra em `FoodsController.processAllImages` (`back-sangue-doce/src/foods/foods.controller.ts:39-42`).
2. Antes da correção, a rota não declarava guard local e não era marcada como administrativa.
3. `FoodsService.queueImagesForAllFoods` lista todos os alimentos e adiciona um job por alimento (`back-sangue-doce/src/foods/foods.service.ts:47-50`).
4. `FoodsImagesQueue.add` cria jobs com até três tentativas (`back-sangue-doce/src/foods/foods-images.queue.ts:11-12`).

### Ataque

```http
POST /foods/images/process-all HTTP/1.1
Host: api.example
```

Sem `Authorization`, um atacante pode repetir a chamada. O resultado é a multiplicação de jobs e consumo de workers/Redis.

### Correção aplicada

Foi adicionado `@UseGuards(AuthGuard, RolesGuard)` e `@Roles(Role.ADMIN)`. Recomenda-se também controlar deduplicação e frequência no serviço/fila.
