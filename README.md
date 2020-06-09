# css暗黑模式快速生成的loader

用法：与css-loader、style-loader等loader一样配置到webpack中。注意顺序，要先处理该loader，将`dmvars`进行转换

#### 例子：
```css

body {
  background-color: dmvars(white, black);
}

```

经该loader转换后得到：

```css
:root {
  --dmvars-3KmhiwoM: white;
}

@media (prefers-color-scheme: dark) {
  :root {
    --dmvars-3KmhiwoM: black;
  }
}

body {
  background-color: var(--dmvars-3KmhiwoM);
}
```