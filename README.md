# redos
Finite Automaton for SecurityCamp Z3 

## Todo

### To create NFA from Node type below

- [x] Disjunction
- [x] Sequence
- [x] Capture (キャプチャグループ ex: `(abc)`)
- [x] NamedCapture (名前付きグループ ex: `(?<year>[0-9]{4})` )
- [x] Group (非キャプチャグループ ex: `(?:abc)`)
- [x] Many (0回以上の繰り返し)
- [x] Optional
- [] Some (1回以上の繰り返し)
- [] Repeat (指定の文字数繰り返し ex `a{3}`)
- [x] Char
- [x] Dot

### To Detect ReDos

- [] To implement Strong Connected Components(強連結成分分解アルゴリズム実装)
- [] To detect IDA/EDA
