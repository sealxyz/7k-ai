# Create tool

- Guide to add a new tool to the ai agent.

### 1. Create a new folder inside Lib/ai/tools

For instance, let´s break down the bluefin tool:

1. [bluefinExhangeData](./lib/ai/tools/bluefin/bluefinExchangeData.ts)

- Inside this folder, create a new file with the name of the tool.
- Add tool
  - Description
  - Parameters: Use zod to define the parameters.
  - Code: Inside the execute function, add the code to execute the tool.

### 2. Tool configuration

- [app/(chat)/api/chat/route.ts](<./app/(chat)/api/chat/route.ts>)

a. Import the tool

```typescript
import { getBluefinTopAprPools, getBluefinExchangeData } from '@/lib/ai/tools/bluefin'
```

b. Add the tool to the array of tools

```typescript
type AllowedTools =
  | 'getBluefinExchangeData'
  | 'getBluefinTopAprPools'
  | 'getCetusExchangeData'
  | 'getCetusTopAprPools'
//  | 'getAftermathTopAprPools'
```

c. Add the tool to the array of bluefin tools

```typescript
const bluefinExchangeDataTools: AllowedTools[] = ['getBluefinExchangeData', 'getBluefinTopAprPools']
```

d. Add the tool inside the agent

```typescript
        tools: {
          getBluefinExchangeData,
          getBluefinTopAprPools,
          getCetusExchangeData,
          getCetusTopAprPools,
          // getAftermathTopAprPools,
        },
```
