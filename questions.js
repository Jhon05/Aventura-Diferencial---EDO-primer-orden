window.TOPIC_META = {
  pvi: {
    name: 'Bosque del PVI',
    element: 'Bosque',
    topicLabel: 'PVI, existencia y unicidad',
    seal: 'Sello del PVI',
    item: 'Brújula de Existencia'
  },
  separables: {
    name: 'Mar de Variables Separables',
    element: 'Mar',
    topicLabel: 'Variables separables',
    seal: 'Sello de Separación',
    item: 'Pergamino de Separación'
  },
  exactas: {
    name: 'Cueva Exacta',
    element: 'Cueva',
    topicLabel: 'Homogéneas, exactas y factor integrante',
    seal: 'Sello Exacto',
    item: 'Llave Exacta'
  },
  lineales: {
    name: 'Volcán Lineal',
    element: 'Volcán',
    topicLabel: 'Lineales de primer orden y Bernoulli',
    seal: 'Sello Lineal',
    item: 'Escudo de Bernoulli'
  },
  aplicaciones: {
    name: 'Cielo de Aplicaciones',
    element: 'Espacio Aéreo',
    topicLabel: 'Trayectorias, mezclas y poblaciones',
    seal: 'Sello de Modelación',
    item: 'Ala de Aplicaciones'
  },
  boss: {
    name: 'Pirámide Central del Primer Parcial',
    element: 'Pirámide central',
    topicLabel: 'Pregunta especial integradora',
    seal: 'Sello del Primer Parcial',
    item: 'Corona del Primer Corte'
  }
};

window.QUESTION_BANK = {
  pvi: [
    {
      type:'mcq6', level:'Conceptual',
      prompt:'¿Cuál expresión representa mejor un problema de valor inicial para una EDO de primer orden?',
      choices:[
        '$y^{\\prime}=f(x,y)$ solamente',
        '$y^{\\prime}=f(x,y),\\; y(x_0)=y_0$',
        '$F(x,y)=0$ sin condición',
        '$\\int f(x)\\,dx=C$',
        '$y(x)=C e^x$ sin dato inicial',
        '$M(x,y)dx+N(x,y)dy=0$ únicamente'
      ],
      answer:1,
      hint:'Un PVI necesita la ecuación diferencial y un dato que seleccione una curva particular.',
      explanation:'Un problema de valor inicial incluye una EDO y una condición inicial, por ejemplo $y(x_0)=y_0$.'
    },
    {
      type:'tf-dropdown', level:'Teorema',
      prompt:'El teorema básico de existencia y unicidad para $y^{\\prime}=f(x,y)$ suele pedir continuidad local de $f$ y de $\\partial f/\\partial y$ cerca de $(x_0,y_0)$.',
      answer:true,
      hint:'Recuerda la condición suficiente usual vista en primer curso.',
      explanation:'Una hipótesis suficiente clásica es que $f$ y $f_y$ sean continuas en un rectángulo alrededor del punto inicial.'
    },
    {
      type:'statements', level:'I-IV',
      prompt:'Marca cada afirmación como verdadera o falsa.',
      statements:[
        'I. Un PVI puede seleccionar una solución particular de una familia de soluciones.',
        'II. Una EDO de primer orden normalmente tiene una constante arbitraria en su solución general.',
        'III. La condición inicial nunca afecta la constante de integración.',
        'IV. La unicidad evita que dos soluciones pasen por el mismo dato inicial.'
      ],
      answers:[true,true,false,true],
      hint:'Piensa en cómo la condición inicial fija la constante y en qué significa unicidad.',
      explanation:'I, II y IV son verdaderas. III es falsa porque la condición inicial justamente determina la constante.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Si $y^{\\prime}=2x$ y $y(0)=3$, la solución es $y=x^2+C$. ¿Cuál es el valor entero de $C$?',
      answer:3,
      hint:'Sustituye $x=0$ y $y=3$.',
      explanation:'Al evaluar $3=0^2+C$, se obtiene $C=3$.'
    },
    {
      type:'mcq6', level:'Clasificación',
      prompt:'La ecuación $y^{\\prime}=x+y$ se clasifica de forma natural como:',
      choices:[
        'separable inmediata',
        'lineal de primer orden',
        'exacta directa',
        'Bernoulli con $n=0$ únicamente',
        'homogénea en la forma $F(y/x)$',
        'autónoma'
      ],
      answer:1,
      hint:'Llévala a la forma $y^{\\prime}+p(x)y=q(x)$.',
      explanation:'Se escribe $y^{\\prime}-y=x$, que es lineal de primer orden.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Si $y=Ce^{2x}$ y $y(0)=5$, ¿cuál es el valor de $C$?',
      answer:5,
      hint:'Usa $e^0=1$.',
      explanation:'Como $5=C e^0$, entonces $C=5$.'
    }
  ],
  separables: [
    {
      type:'mcq6', level:'Método',
      prompt:'Para resolver $\\dfrac{dy}{dx}=xy$, el primer paso correcto de separación es:',
      choices:[
        '$y\\,dy=x\\,dx$',
        '$\\dfrac{1}{y}\\,dy=x\\,dx$',
        '$x\\,dy=y\\,dx$',
        '$\\dfrac{1}{x}\\,dy=y\\,dx$',
        '$dy=(x+y)dx$',
        '$y\\,dx=x\\,dy$'
      ],
      answer:1,
      hint:'Debes dejar todo lo que depende de $y$ con $dy$ y lo de $x$ con $dx$.',
      explanation:'Dividiendo por $y$, se obtiene $dy/y=x\\,dx$.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Resuelve $y^{\\prime}=3y$, $y(0)=2$. La solución tiene la forma $y=Ce^{3x}$. ¿Cuál es $C$?',
      answer:2,
      hint:'Evalúa en $x=0$.',
      explanation:'Al imponer $y(0)=2$, se obtiene $C=2$.'
    },
    {
      type:'tf-dropdown', level:'Conceptual',
      prompt:'Toda ecuación autónoma $y^{\\prime}=g(y)$ es separable, considerando por separado los equilibrios donde $g(y)=0$.',
      answer:true,
      hint:'Intenta escribir $dy/g(y)=dx$.',
      explanation:'Si $g(y)\\ne0$, se puede separar como $dy/g(y)=dx$; los puntos de equilibrio se tratan aparte.'
    },
    {
      type:'statements', level:'I-IV',
      prompt:'Sobre ecuaciones separables, marca V/F.',
      statements:[
        'I. En $y^{\\prime}=xy^2$ se puede escribir $y^{-2}dy=x\\,dx$.',
        'II. En $y^{\\prime}=x+y$ la separación es inmediata.',
        'III. En $y^{\\prime}=x(1+y^2)$ aparece $\\arctan(y)$ al integrar.',
        'IV. Separar variables siempre evita usar una constante de integración.'
      ],
      answers:[true,false,true,false],
      hint:'Revisa qué ecuaciones permiten aislar funciones de $x$ y de $y$.',
      explanation:'I y III son verdaderas. II es falsa porque $x+y$ no separa directamente; IV es falsa porque la constante aparece al integrar.'
    },
    {
      type:'mcq6', level:'Solución',
      prompt:'Una solución general de $y^{\\prime}=x(1+y^2)$ es:',
      choices:[
        '$\\arctan y=\\frac{x^2}{2}+C$',
        '$\\ln|y|=\\frac{x^2}{2}+C$',
        '$y=\\frac{x^2}{2}+C$',
        '$\\tan x=\\frac{y^2}{2}+C$',
        '$\\arcsin y=x^2+C$',
        '$\\frac{1}{1+y^2}=x+C$'
      ],
      answer:0,
      hint:'Integra $dy/(1+y^2)$.',
      explanation:'Se separa como $dy/(1+y^2)=x\\,dx$, luego $\\arctan y=x^2/2+C$.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Para $y^{\\prime}=\\dfrac{x}{y}$ se obtiene $y^2=x^2+C$. Si $y(0)=4$, ¿cuál es $C$?',
      answer:16,
      hint:'Sustituye $x=0$, $y=4$.',
      explanation:'$4^2=0+C$, por tanto $C=16$.'
    }
  ],
  exactas: [
    {
      type:'mcq6', level:'Criterio',
      prompt:'La ecuación $M(x,y)dx+N(x,y)dy=0$ es exacta si:',
      choices:[
        '$M_x=N_y$',
        '$M_y=N_x$',
        '$M=N$',
        '$M_x+N_y=0$',
        '$M_y+N_x=1$',
        '$N_y=0$'
      ],
      answer:1,
      hint:'Debe existir $F$ tal que $F_x=M$ y $F_y=N$.',
      explanation:'Por igualdad de derivadas cruzadas, $M_y=F_{xy}=F_{yx}=N_x$.'
    },
    {
      type:'tf-dropdown', level:'Exactas',
      prompt:'La ecuación $(2xy+1)dx+x^2dy=0$ es exacta.',
      answer:true,
      hint:'Calcula $M_y$ y $N_x$.',
      explanation:'Aquí $M=2xy+1$ y $N=x^2$. Entonces $M_y=2x=N_x$.'
    },
    {
      type:'statements', level:'I-IV',
      prompt:'Sobre homogéneas, exactas y factor integrante, marca V/F.',
      statements:[
        'I. Si $y^{\\prime}=F(y/x)$, suele usarse $y=vx$.',
        'II. Si $M_y=N_x$, la ecuación diferencial es exacta.',
        'III. Un factor integrante puede convertir una ecuación no exacta en exacta.',
        'IV. Toda ecuación exacta debe ser necesariamente separable.'
      ],
      answers:[true,true,true,false],
      hint:'Piensa en el papel de la sustitución homogénea y de la función potencial.',
      explanation:'I, II y III son verdaderas. IV es falsa: exactitud y separabilidad son métodos distintos.'
    },
    {
      type:'mcq6', level:'Homogéneas',
      prompt:'Para resolver una ecuación homogénea $y^{\\prime}=F(y/x)$ se usa normalmente:',
      choices:[
        '$y=vx$',
        '$v=y^{1-n}$',
        '$\\mu=e^{\\int p(x)dx}$',
        '$x=e^t$',
        '$y=u+v$',
        '$M_y=N_x$ sin sustitución'
      ],
      answer:0,
      hint:'La idea es convertir $y/x$ en una nueva variable.',
      explanation:'Con $y=vx$, se tiene $y^{\\prime}=v+xv^{\\prime}$ y se reduce a separable.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Para $M=2xy+1$ y $N=x^2$, ¿cuál es el coeficiente de $x$ en $M_y$?',
      answer:2,
      hint:'Deriva $M$ respecto a $y$.',
      explanation:'$M_y=2x$, así que el coeficiente de $x$ es $2$.'
    },
    {
      type:'mcq6', level:'Potencial',
      prompt:'Una función potencial para $(2xy+1)dx+x^2dy=0$ es:',
      choices:[
        '$F=x^2y+x$',
        '$F=xy^2+x$',
        '$F=x^2+y$',
        '$F=2xy+x^2$',
        '$F=x^2y+y$',
        '$F=x^2y+xy$'
      ],
      answer:0,
      hint:'Integra $M=2xy+1$ respecto a $x$ y compara con $N$.',
      explanation:'Integrando $M$ respecto a $x$: $F=x^2y+x+g(y)$. Luego $F_y=x^2+g^{\\prime}(y)=x^2$, así que $g$ es constante.'
    }
  ],
  lineales: [
    {
      type:'mcq6', level:'Lineal',
      prompt:'La forma estándar de una ecuación lineal de primer orden es:',
      choices:[
        '$y^{\\prime}+p(x)y=q(x)$',
        '$y^{\\prime}=F(y/x)$',
        '$Mdx+Ndy=0$ con $M_y=N_x$',
        '$y^{\\prime}+p(x)y=q(x)y^n$',
        '$y^{\\prime}=g(x)h(y)$',
        '$y^{\\prime}=ay^2+by+c$'
      ],
      answer:0,
      hint:'En la ecuación lineal, $y$ aparece con potencia uno.',
      explanation:'La forma estándar es $y^{\\prime}+p(x)y=q(x)$.'
    },
    {
      type:'mcq6', level:'Factor integrante',
      prompt:'Para $y^{\\prime}+p(x)y=q(x)$, el factor integrante usual es:',
      choices:[
        '$\\mu(x)=e^{\\int p(x)dx}$',
        '$\\mu(x)=e^{\\int q(x)dx}$',
        '$\\mu(y)=e^{\\int p(y)dy}$',
        '$\\mu=xp(x)$',
        '$\\mu=q(x)/p(x)$',
        '$\\mu=\\int y\\,dx$'
      ],
      answer:0,
      hint:'El factor depende de $p(x)$, no de $q(x)$.',
      explanation:'Multiplicar por $\\mu=e^{\\int p(x)dx}$ convierte el lado izquierdo en $(\\mu y)^{\\prime}$.'
    },
    {
      type:'tf-dropdown', level:'Bernoulli',
      prompt:'La ecuación $y^{\\prime}+p(x)y=q(x)y^n$ con $n\\ne 0,1$ se puede transformar usando $v=y^{1-n}$.',
      answer:true,
      hint:'Recuerda la sustitución de Bernoulli.',
      explanation:'La sustitución estándar para Bernoulli es $v=y^{1-n}$.'
    },
    {
      type:'statements', level:'I-IV',
      prompt:'Sobre lineales y Bernoulli, marca V/F.',
      statements:[
        'I. $y^{\\prime}+2y=x$ es lineal de primer orden.',
        'II. En una Bernoulli con $n=2$, puede usarse $v=y^{-1}$.',
        'III. El factor integrante de $y^{\\prime}+p(x)y=q(x)$ depende de $q(x)$ únicamente.',
        'IV. La ecuación $y^{\\prime}+y=y^3$ es Bernoulli.'
      ],
      answers:[true,true,false,true],
      hint:'Para Bernoulli revisa la forma $q(x)y^n$.',
      explanation:'I, II y IV son verdaderas. III es falsa porque el factor integrante depende de $p(x)$.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'En la Bernoulli $y^{\\prime}+y=xy^3$, ¿cuál es el exponente $n$?',
      answer:3,
      hint:'Compara con $y^{\\prime}+p(x)y=q(x)y^n$.',
      explanation:'El término no lineal es $xy^3$, por tanto $n=3$.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Para $y^{\\prime}+2y=0$, la solución es $y=Ce^{-2x}$. Si $y(0)=7$, ¿cuál es $C$?',
      answer:7,
      hint:'Evalúa en $x=0$.',
      explanation:'$7=Ce^0=C$.'
    }
  ],
  aplicaciones: [
    {
      type:'mcq6', level:'Modelación',
      prompt:'En un problema de mezclas, la ecuación típica para la cantidad $A(t)$ de soluto suele tener la forma:',
      choices:[
        '$A^{\\prime}=\\text{entrada}-\\text{salida}$',
        '$A^{\\prime}=\\text{entrada}+\\text{salida}$',
        '$A^{\\prime}=\\text{salida}-\\text{entrada}$',
        '$A^{\\prime}=0$ siempre',
        '$A^{\\prime}=A^2$ siempre',
        '$A^{\\prime}=\\int A(t)dt$'
      ],
      answer:0,
      hint:'La cantidad cambia por lo que entra menos lo que sale.',
      explanation:'En mezclas se usa balance: tasa de cambio = tasa de entrada − tasa de salida.'
    },
    {
      type:'tf-dropdown', level:'Poblaciones',
      prompt:'El modelo exponencial $P^{\\prime}=kP$ es separable.',
      answer:true,
      hint:'Intenta escribir $dP/P=kdt$.',
      explanation:'Se separa como $dP/P=kdt$.'
    },
    {
      type:'statements', level:'I-IV',
      prompt:'Sobre aplicaciones de primer orden, marca V/F.',
      statements:[
        'I. En dinámica poblacional, $P(t)$ suele representar población.',
        'II. En mezclas, la concentración de salida depende de la cantidad de soluto y del volumen.',
        'III. Las trayectorias ortogonales tienen pendientes recíprocas negativas respecto a la familia dada.',
        'IV. Los problemas de aplicación nunca requieren condición inicial.'
      ],
      answers:[true,true,true,false],
      hint:'Piensa en modelación: variable, tasa, condición inicial y relación geométrica.',
      explanation:'I, II y III son verdaderas. IV es falsa porque las aplicaciones suelen requerir datos iniciales.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Si $P^{\\prime}=2P$ y $P(0)=10$, la solución es $P=Ce^{2t}$. ¿Cuál es $C$?',
      answer:10,
      hint:'Evalúa en $t=0$.',
      explanation:'$10=Ce^0=C$.'
    },
    {
      type:'mcq6', level:'Trayectorias',
      prompt:'Si una familia de curvas tiene pendiente $m(x,y)$, las trayectorias ortogonales tienen pendiente:',
      choices:[
        '$-1/m(x,y)$',
        '$m(x,y)$',
        '$1/m(x,y)$',
        '$-m(x,y)$',
        '$m(x,y)+1$',
        '$m(x,y)^2$'
      ],
      answer:0,
      hint:'Dos curvas ortogonales tienen pendientes cuyo producto es $-1$.',
      explanation:'La pendiente ortogonal es la recíproca negativa: $-1/m$.'
    },
    {
      type:'integer', level:'Valor entero',
      prompt:'Un tanque tiene 100 litros y entra agua salada a 3 L/min mientras sale a 3 L/min. ¿Cuál es el volumen constante del tanque?',
      answer:100,
      hint:'Si entrada y salida son iguales, el volumen no cambia.',
      explanation:'El volumen permanece constante en 100 litros.'
    }
  ]
};

window.QUESTION_BANK.boss = [
  ...window.QUESTION_BANK.pvi.slice(0,2),
  ...window.QUESTION_BANK.separables.slice(0,2),
  ...window.QUESTION_BANK.exactas.slice(0,2),
  ...window.QUESTION_BANK.lineales.slice(0,2),
  ...window.QUESTION_BANK.aplicaciones.slice(0,2)
];


// V13: preguntas más complejas para que no sean solo reconocimiento inmediato.
(function(){
  const extra = {
    pvi: [
      {
        type:'mcq6', level:'Integrador',
        prompt:'Considere el PVI $y^{\\prime}=\\sqrt{|y|}$, $y(0)=0$. ¿Qué afirmación describe correctamente la unicidad cerca de $(0,0)$?',
        choices:[
          'Hay unicidad porque $f(y)$ es continua.',
          'No se garantiza unicidad por el criterio usual, pues $\\partial f/\\partial y$ falla en $y=0$.',
          'No existe solución porque $f(0)=0$.',
          'La solución debe ser negativa para $x>0$.',
          'La única solución posible es $y=x$.',
          'El criterio falla porque la ecuación no es de primer orden.'
        ],
        answer:1,
        hint:'Continuidad de $f$ no basta para unicidad en el teorema clásico.',
        explanation:'La función es continua, por lo que hay existencia local, pero la derivada respecto a $y$ no es continua en $0$; el criterio clásico no garantiza unicidad.'
      },
      {
        type:'statements', level:'Análisis I-IV',
        prompt:'Para el PVI $y^{\\prime}=xy+y^2$, $y(0)=1$, marca V/F.',
        statements:[
          'I. La función $f(x,y)=xy+y^2$ es continua cerca de $(0,1)$.',
          'II. $f_y(x,y)=x+2y$ es continua cerca de $(0,1)$.',
          'III. El teorema usual garantiza existencia y unicidad local.',
          'IV. El teorema garantiza automáticamente existencia global para todo $x\\in\\mathbb R$.'
        ],
        answers:[true,true,true,false],
        hint:'Distingue existencia local de existencia global.',
        explanation:'Las tres primeras son verdaderas por continuidad local. La cuarta es falsa: el teorema local no garantiza solución global.'
      }
    ],
    separables: [
      {
        type:'mcq6', level:'Procedimental',
        prompt:'Al resolver $y^{\\prime}=\\dfrac{x}{1+y^2}$ con $y(0)=1$, después de separar e integrar se obtiene:',
        choices:[
          '$y+\\frac{y^3}{3}=\\frac{x^2}{2}+\\frac{4}{3}$',
          '$\\arctan y=\\frac{x^2}{2}+1$',
          '$y^2+1=x^2+C$',
          '$\\ln(1+y^2)=x^2+C$',
          '$y+\\frac{y^2}{2}=\\frac{x^2}{2}+1$',
          '$\\frac{1}{1+y^2}=\\frac{x^2}{2}+C$'
        ],
        answer:0,
        hint:'Multiplica por $1+y^2$ e integra $\\int(1+y^2)dy$.',
        explanation:'Se obtiene $(1+y^2)dy=x\\,dx$, luego $y+y^3/3=x^2/2+C$. Con $y(0)=1$, $C=4/3$.'
      },
      {
        type:'integer', level:'Constante',
        prompt:'Para $y^{\\prime}=2xy$ se obtiene $\\ln|y|=x^2+C$. Si $y(0)=e^5$, ¿cuál es el valor entero de $C$?',
        answer:5,
        hint:'Sustituye $x=0$ en $\\ln|y|=x^2+C$.',
        explanation:'Como $\\ln(e^5)=5$, entonces $C=5$.'
      }
    ],
    exactas: [
      {
        type:'mcq6', level:'Exacta con potencial',
        prompt:'Para $(3x^2y+2)dx+(x^3+\\cos y)dy=0$, una función potencial $F$ puede ser:',
        choices:[
          '$F=x^3y+2x+\\sin y$',
          '$F=3xy^2+2x+\\sin y$',
          '$F=x^3y+2y+\\cos y$',
          '$F=x^2y^3+2x+\\sin y$',
          '$F=x^3y+2x-\\sin y$',
          '$F=3x^2y+x^3+\\sin y$'
        ],
        answer:0,
        hint:'Integra $M=3x^2y+2$ con respecto a $x$.',
        explanation:'Al integrar $M$ en $x$, $F=x^3y+2x+g(y)$. Luego $F_y=x^3+g^\u2032(y)=x^3+\\cos y$, así que $g(y)=\\sin y$.'
      },
      {
        type:'statements', level:'Factor integrante',
        prompt:'Sea $Mdx+Ndy=0$ no exacta. Marca V/F.',
        statements:[
          'I. Si $(M_y-N_x)/N$ depende solo de $x$, puede existir factor integrante $\\mu(x)$.',
          'II. Un factor integrante convierte la ecuación multiplicada en exacta.',
          'III. Si una ecuación no es exacta, nunca puede resolverse por potencial.',
          'IV. La condición exacta para la ecuación multiplicada es $(\\mu M)_y=(\\mu N)_x$.'
        ],
        answers:[true,true,false,true],
        hint:'Recuerda que la exactitud puede aparecer después de multiplicar por $\\mu$.',
        explanation:'I, II y IV son verdaderas. III es falsa porque un factor integrante puede convertirla en exacta.'
      }
    ],
    lineales: [
      {
        type:'mcq6', level:'Lineal/Bernoulli',
        prompt:'La ecuación $y^{\\prime}+\\frac{2}{x}y=x^2y^3$ se resuelve como Bernoulli. ¿Cuál sustitución es adecuada?',
        choices:[
          '$v=y^{-2}$',
          '$v=y^2$',
          '$v=xy$',
          '$v=y/x$',
          '$v=e^{\\int 2/x\\,dx}$',
          '$v=x^2y$'
        ],
        answer:0,
        hint:'En Bernoulli se usa $v=y^{1-n}$. Aquí $n=3$.',
        explanation:'Como $n=3$, se toma $v=y^{1-3}=y^{-2}$.'
      },
      {
        type:'integer', level:'Factor integrante',
        prompt:'Para $y^{\\prime}+\\frac{3}{x}y=x^2$, el factor integrante es $\\mu=x^k$ para $x>0$. ¿Cuál es $k$?',
        answer:3,
        hint:'Calcula $e^{\\int 3/x\\,dx}$.',
        explanation:'$\\mu=e^{3\\ln x}=x^3$, por tanto $k=3$.'
      }
    ],
    aplicaciones: [
      {
        type:'mcq6', level:'Mezclas',
        prompt:'Un tanque con volumen constante $100$ L recibe salmuera a $4$ L/min con concentración $2$ g/L y sale mezcla a $4$ L/min. Si $A(t)$ es la sal en gramos, la ecuación correcta es:',
        choices:[
          '$A^\\prime=8-\\frac{4}{100}A$',
          '$A^\\prime=4-\\frac{2}{100}A$',
          '$A^\\prime=8+\\frac{4}{100}A$',
          '$A^\\prime=2-4A$',
          '$A^\\prime=100A-8$',
          '$A^\\prime=\\frac{4}{100}A-8$'
        ],
        answer:0,
        hint:'Entrada: flujo por concentración. Salida: flujo por concentración interna $A/100$.',
        explanation:'Entra $4\\cdot2=8$ g/min. Sale $4(A/100)$. Entonces $A^\\prime=8-4A/100$.'
      },
      {
        type:'statements', level:'Modelación',
        prompt:'Sobre trayectorias ortogonales y modelos de población, marca V/F.',
        statements:[
          'I. Si una familia tiene pendiente $m$, la familia ortogonal tiene pendiente $-1/m$.',
          'II. $P^\\prime=kP$ con $k>0$ modela crecimiento exponencial.',
          'III. En un tanque de volumen constante, la tasa de salida de soluto depende de la concentración interna.',
          'IV. Las trayectorias ortogonales siempre se obtienen con la misma ecuación diferencial original.'
        ],
        answers:[true,true,true,false],
        hint:'La pendiente ortogonal cambia la ecuación diferencial.',
        explanation:'I, II y III son verdaderas. IV es falsa porque se reemplaza la pendiente por la recíproca negativa.'
      }
    ]
  };
  for(const [topic, list] of Object.entries(extra)){
    if(window.QUESTION_BANK[topic]) window.QUESTION_BANK[topic].push(...list);
  }

  const solutionChecks = {
    pvi: [
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Dado el PVI $y^{\\prime}=4x,\\; y(0)=3$, ¿cuál de las siguientes funciones satisface el problema?',
        choices:[
          '$y=2x^2+3$',
          '$y=4x^2+3$',
          '$y=2x^2-3$',
          '$y=2x+3$',
          '$y=3e^{4x}$',
          '$y=2x^2+C$'
        ],
        answer:0,
        hint:'Deriva cada candidata y verifica la condición inicial.',
        explanation:'Para $y=2x^2+3$ se tiene $y^{\\prime}=4x$ y $y(0)=3$. Las demás opciones fallan en la derivada, en el dato inicial o no son una solución particular.'
      },
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Dado $y^{\\prime}=6x$ y $y(1)=5$, ¿cuál función cumple la ecuación y el dato inicial?',
        choices:[
          '$y=3x^2+2$',
          '$y=6x^2+5$',
          '$y=3x^2+5$',
          '$y=3x+2$',
          '$y=5e^{6x}$',
          '$y=6x+5$'
        ],
        answer:0,
        hint:'Primero integra $y^{\\prime}=6x$ y luego impón $y(1)=5$.',
        explanation:'La familia general es $y=3x^2+C$. Como $5=3(1)^2+C$, se obtiene $C=2$, por tanto $y=3x^2+2$.'
      }
    ],
    separables: [
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Dada la ecuación separable $y^{\\prime}=3y$ con $y(0)=2$, ¿cuál función es solución?',
        choices:[
          '$y=2e^{3x}$',
          '$y=2e^{-3x}$',
          '$y=2+3x$',
          '$y=e^{3x}+2$',
          '$y=3e^{2x}$',
          '$y=2x^3$'
        ],
        answer:0,
        hint:'Una solución de $y^{\\prime}=ky$ tiene forma $Ce^{kx}$.',
        explanation:'Para $y=2e^{3x}$, se cumple $y^{\\prime}=6e^{3x}=3(2e^{3x})=3y$ y además $y(0)=2$.'
      },
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Dada $\\dfrac{dy}{dx}=\\dfrac{2x}{y}$ con $y(0)=4$, ¿cuál relación implícita representa la solución?',
        choices:[
          '$y^2=2x^2+16$',
          '$y^2=x^2+16$',
          '$y=2x+4$',
          '$y^2=2x^2+4$',
          '$\\ln|y|=x^2+4$',
          '$y^2=4x^2+16$'
        ],
        answer:0,
        hint:'Multiplica por $y$ e integra: $y\\,dy=2x\\,dx$.',
        explanation:'Al integrar se obtiene $\\frac{1}{2}y^2=x^2+C$, es decir $y^2=2x^2+C_1$. Como $y(0)=4$, entonces $C_1=16$.'
      }
    ],
    exactas: [
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Dada $(4xy+1)dx+(2x^2+\\cos y)dy=0$, ¿cuál familia implícita representa soluciones?',
        choices:[
          '$2x^2y+x+\\sin y=C$',
          '$4xy^2+x+\\sin y=C$',
          '$2x^2y+y+\\cos y=C$',
          '$2xy+x-\\sin y=C$',
          '$4x^2y+1+\\sin y=C$',
          '$2x^2+y+\\sin y=C$'
        ],
        answer:0,
        hint:'Busca $F$ con $F_x=4xy+1$ y $F_y=2x^2+\\cos y$.',
        explanation:'Si $F=2x^2y+x+\\sin y$, entonces $F_x=4xy+1$ y $F_y=2x^2+\\cos y$. Por tanto $F=C$ da la familia de soluciones.'
      },
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Para la ecuación exacta $(6xy+5)dx+(3x^2+2\\cos y)dy=0$, ¿qué potencial $F$ genera la solución $F=C$?',
        choices:[
          '$F=3x^2y+5x+2\\sin y$',
          '$F=6xy^2+5x+2\\sin y$',
          '$F=3x^2y+5y+2\\cos y$',
          '$F=3xy+5x-2\\sin y$',
          '$F=6x^2y+5+2\\sin y$',
          '$F=3x^2+5y+2\\sin y$'
        ],
        answer:0,
        hint:'Integra $M=6xy+5$ respecto de $x$.',
        explanation:'Al integrar $M$ respecto de $x$ resulta $F=3x^2y+5x+g(y)$. Luego $F_y=3x^2+g^{\\prime}(y)=3x^2+2\\cos y$, así que $g(y)=2\\sin y$.'
      }
    ],
    lineales: [
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Dado el PVI $y^{\\prime}+2y=6$, $y(0)=5$, ¿cuál función es solución?',
        choices:[
          '$y=3+2e^{-2x}$',
          '$y=3+2e^{2x}$',
          '$y=5e^{-2x}$',
          '$y=6+2e^{-2x}$',
          '$y=3-2e^{-2x}$',
          '$y=5+6x$'
        ],
        answer:0,
        hint:'La solución de equilibrio es $y=3$ porque $2y=6$.',
        explanation:'Para $y=3+2e^{-2x}$, se tiene $y^{\\prime}=-4e^{-2x}$. Entonces $y^{\\prime}+2y=-4e^{-2x}+2(3+2e^{-2x})=6$ y $y(0)=5$.'
      },
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Para la ecuación de Bernoulli $y^{\\prime}+y=xy^3$, ¿cuál sustitución es compatible con el método usual?',
        choices:[
          '$v=y^{-2}$',
          '$v=y^2$',
          '$v=xy$',
          '$v=y/x$',
          '$v=e^x$',
          '$v=x^2y$'
        ],
        answer:0,
        hint:'En Bernoulli $y^{\\prime}+p(x)y=q(x)y^n$ se usa $v=y^{1-n}$.',
        explanation:'Aquí $n=3$, por tanto $v=y^{1-3}=y^{-2}$. Esta sustitución transforma la ecuación en una lineal para $v$.'
      }
    ],
    aplicaciones: [
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'En un modelo poblacional $P^{\\prime}=2P$ con $P(0)=7$, ¿cuál función satisface el problema?',
        choices:[
          '$P(t)=7e^{2t}$',
          '$P(t)=7e^{-2t}$',
          '$P(t)=7+2t$',
          '$P(t)=e^{2t}+7$',
          '$P(t)=2e^{7t}$',
          '$P(t)=7t^2$'
        ],
        answer:0,
        hint:'Deriva la candidata y verifica si $P^{\\prime}=2P$.',
        explanation:'Para $P(t)=7e^{2t}$ se tiene $P^{\\prime}(t)=14e^{2t}=2P(t)$ y $P(0)=7$.'
      },
      {
        type:'mcq6', level:'Comprobar solución',
        prompt:'Un tanque satisface $A^{\\prime}=8-\\frac{1}{20}A$. ¿Cuál función es solución de equilibrio constante?',
        choices:[
          '$A(t)=160$',
          '$A(t)=8$',
          '$A(t)=20$',
          '$A(t)=160e^{-t/20}$',
          '$A(t)=8e^{-20t}$',
          '$A(t)=20e^{-t/20}$'
        ],
        answer:0,
        hint:'Una solución constante cumple $A^{\\prime}=0$.',
        explanation:'Si $A(t)=160$, entonces $A^{\\prime}=0$ y $8-\\frac{1}{20}(160)=8-8=0$. Por tanto es una solución constante de equilibrio.'
      }
    ]
  };
  for(const [topic, list] of Object.entries(solutionChecks)){
    if(window.QUESTION_BANK[topic]) window.QUESTION_BANK[topic].push(...list);
  }

  window.QUESTION_BANK.boss = [
    {
      type:'statements', level:'Final difícil 1',
      prompt:'<b>Monstruo final 1/5.</b> Marca cada afirmación como Verdadera o Falsa. No hay bono por acertar; un error reinicia la pirámide y resta 0.5.',
      statements:[
        '1. Si $f$ y $f_y$ son continuas cerca de $(x_0,y_0)$, el PVI $y^{\\prime}=f(x,y)$ tiene solución local única.',
        '2. Toda ecuación de la forma $y^{\\prime}=g(x)h(y)$ puede separarse donde $h(y)\neq0$.',
        '3. Si $M_y=N_x$, entonces una función potencial $F$ cumple $F_x=N$ y $F_y=M$.',
        '4. El factor integrante de $y^{\\prime}+p(x)y=q(x)$ es $\mu(x)=e^{\int p(x)\,dx}$.',
        '5. En mezclas con volumen constante, la salida de soluto suele ser flujo de salida por concentración interna.'
      ],
      answers:[true,true,false,true,true],
      hint:'Revisa cuidadosamente el orden de las derivadas de la función potencial.',
      explanation:'La afirmación 3 es falsa: si $Mdx+Ndy=0$ es exacta, entonces $F_x=M$ y $F_y=N$.'
    },
    {
      type:'statements', level:'Final difícil 2',
      prompt:'<b>Monstruo final 2/5.</b> Marca cada afirmación como Verdadera o Falsa.',
      statements:[
        '1. En $y^{\\prime}=xy^2$ se puede escribir $y^{-2}\,dy=x\,dx$ siempre que $y\neq0$.',
        '2. La sustitución usual para $y^{\\prime}=F(y/x)$ es $y=vx$.',
        '3. Si una ecuación no es exacta, ningún factor integrante puede convertirla en exacta.',
        '4. En Bernoulli $y^{\\prime}+p(x)y=q(x)y^n$, con $n\neq0,1$, se usa $v=y^{1-n}$.',
        '5. Para trayectorias ortogonales, si la pendiente original es $m$, la pendiente nueva es $m^{-1}$.'
      ],
      answers:[true,true,false,true,false],
      hint:'Las trayectorias ortogonales usan recíproca negativa.',
      explanation:'Las afirmaciones falsas son 3 y 5. Un factor integrante sí puede hacer exacta una ecuación, y la pendiente ortogonal es $-1/m$.'
    },
    {
      type:'statements', level:'Final difícil 3',
      prompt:'<b>Monstruo final 3/5.</b> Marca cada afirmación como Verdadera o Falsa.',
      statements:[
        '1. Para $(2xy+1)dx+x^2dy=0$, se tiene $M_y=N_x$.',
        '2. En un PVI, la condición inicial puede determinar la constante de integración.',
        '3. $y^{\\prime}=x+y$ es separable de manera inmediata como $dy/(x+y)=dx$.',
        '4. $P^{\\prime}=kP$, con $k>0$, representa crecimiento exponencial.',
        '5. La solución general de una EDO de primer orden suele contener una constante arbitraria.'
      ],
      answers:[true,true,false,true,true],
      hint:'No toda expresión con $x+y$ permite separar variables.',
      explanation:'La afirmación 3 es falsa: $x+y$ mezcla variables y no produce separación directa.'
    },
    {
      type:'statements', level:'Final extremo 4',
      prompt:'<b>Monstruo final 4/5.</b> Marca cada afirmación como Verdadera o Falsa.',
      statements:[
        '1. Si $F(x,y)=x^3y+2x+\sin y$, entonces $F_x=3x^2y+2$ y $F_y=x^3+\cos y$.',
        '2. En $y^{\\prime}+\frac{3}{x}y=x^2$, para $x>0$, un factor integrante es $x^3$.',
        '3. En un tanque con entrada $r$ y concentración $c$, la tasa de entrada de soluto es $r/c$.',
        '4. La ecuación autónoma $y^{\\prime}=g(y)$ se puede separar como $dy/g(y)=dx$ cuando $g(y)\neq0$.',
        '5. Si $M_y=N_x$ en una región adecuada, la ecuación exacta se resuelve buscando $F(x,y)=C$.'
      ],
      answers:[true,true,false,true,true],
      hint:'En mezclas, entrada de soluto = flujo por concentración.',
      explanation:'La afirmación 3 es falsa: la entrada de soluto es $r\,c$, no $r/c$.'
    },
    {
      type:'statements', level:'Final extremo 5',
      prompt:'<b>Monstruo final 5/5.</b> Última defensa del guardián. Marca Verdadero o Falso.',
      statements:[
        '1. La hipótesis de continuidad de $f$ garantiza existencia local, pero no siempre unicidad.',
        '2. En $y^{\\prime}=x(1+y^2)$ aparece $\arctan(y)$ al integrar.',
        '3. Un factor integrante $\mu(x)$ se detecta, en un criterio usual, cuando $(M_y-N_x)/N$ depende solo de $x$.',
        '4. En una lineal $y^{\\prime}+p(x)y=q(x)$, multiplicar por $\mu$ busca que el lado izquierdo sea $(\mu y)^{\\prime}$.',
        '5. Si $P^{\\prime}=kP$ con $k<0$, entonces $P$ crece exponencialmente.'
      ],
      answers:[true,true,true,true,false],
      hint:'La última afirmación cambia con el signo de $k$.',
      explanation:'La afirmación 5 es falsa: con $k<0$ hay decaimiento exponencial.'
    }
  ];
})();
