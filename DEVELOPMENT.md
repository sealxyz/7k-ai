# Create new tool

* Description: Steps to create and a new tool to the chatbot.

### 1. Lib/ai/tools

1. bluefinUserPositions.ts

dentro de la funcion execute se ejecuta el codigo asyncronico de la tool.

2.

Opcion 1: Llamadas a rpc client de sui mediante el suiClient o bluefCLient (clase propia, no de la libreria)

Opcion 2: Trabajar con un archivo de texto y parsearlo.

Esto funcion igual QUE UN CONTROLLER.

3. Donde se configura la tool

/app/(chat)/api/chat/route.ts

a. Importar la tool

```
import { getBluefinTopAprPools, getBluefinExchangeData } from '@/lib/ai/tools/bluefin'
```

b. Agregar la tool al array de tools

```
type AllowedTools =
  | 'getBluefinExchangeData'
  | 'getBluefinTopAprPools'
  | 'getCetusExchangeData'
  | 'getCetusTopAprPools'
//  | 'getAftermathTopAprPools'
```

c. Agregar la tool al array de bluefin tools

```
const bluefinExchangeDataTools: AllowedTools[] = ['getBluefinExchangeData', 'getBluefinTopAprPools']
```

d. Agregar la tool dentro del agente

```
        tools: {
          getBluefinExchangeData,
          getBluefinTopAprPools,
          getCetusExchangeData,
          getCetusTopAprPools,
          // getAftermathTopAprPools,
        },
```
