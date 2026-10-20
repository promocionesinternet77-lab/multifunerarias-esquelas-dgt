export interface EpitaphItem {
  id: string;
  category: 'Breves' | 'Solemnes y Clásicos' | 'Religiosos y Espirituales' | 'Inspiradores y Poéticos' | 'Familiares y de Amor';
  text: string;
  origin?: string;
}

export interface BiographyTemplateItem {
  id: string;
  title: string;
  category: 'Para Madres' | 'Para Padres' | 'Para Abuelos y Abuelas' | 'Breves y Clásicas' | 'Vocación y Servicio' | 'Generales y Familiares';
  description: string;
  template: string;
}

export const EPITAPH_CATEGORIES: EpitaphItem['category'][] = [
  'Breves',
  'Solemnes y Clásicos',
  'Religiosos y Espirituales',
  'Inspiradores y Poéticos',
  'Familiares y de Amor',
];

export const BIOGRAPHY_CATEGORIES: BiographyTemplateItem['category'][] = [
  'Para Madres',
  'Para Padres',
  'Para Abuelos y Abuelas',
  'Breves y Clásicas',
  'Vocación y Servicio',
  'Generales y Familiares',
];

// Catálogo completo de más de 50 epitafios organizados por categoría
export const EPITAPH_CATALOG: EpitaphItem[] = [
  // -------------------------------------------------------------
  // CATEGORÍA 1: BREVES (10)
  // -------------------------------------------------------------
  {
    id: 'ep-br-1',
    category: 'Breves',
    text: 'Tu memoria será por siempre nuestra mayor bendición.',
  },
  {
    id: 'ep-br-2',
    category: 'Breves',
    text: 'Descansa en la paz y el amor eterno.',
  },
  {
    id: 'ep-br-3',
    category: 'Breves',
    text: 'Siempre en nuestros pensamientos, por siempre en nuestros corazones.',
  },
  {
    id: 'ep-br-4',
    category: 'Breves',
    text: 'Una vida hermosa que jamás será olvidada.',
  },
  {
    id: 'ep-br-5',
    category: 'Breves',
    text: 'Tu luz seguirá guiando cada uno de nuestros pasos.',
  },
  {
    id: 'ep-br-6',
    category: 'Breves',
    text: 'Amor eterno, gratitud infinita y recuerdo imborrable.',
  },
  {
    id: 'ep-br-7',
    category: 'Breves',
    text: 'No te has ido del todo, vives en quienes tanto te amamos.',
  },
  {
    id: 'ep-br-8',
    category: 'Breves',
    text: 'Hasta que volvamos a encontrarnos en la eternidad.',
  },
  {
    id: 'ep-br-9',
    category: 'Breves',
    text: 'Paz para tu alma, consuelo para nuestro llanto.',
  },
  {
    id: 'ep-br-10',
    category: 'Breves',
    text: 'Tu bondad y tu sonrisa vivirán por siempre con nosotros.',
  },

  // -------------------------------------------------------------
  // CATEGORÍA 2: SOLEMNES Y CLÁSICOS (10)
  // -------------------------------------------------------------
  {
    id: 'ep-sol-1',
    category: 'Solemnes y Clásicos',
    text: 'Su vida fue un testimonio constante de rectitud, nobleza y devoción hacia los suyos.',
  },
  {
    id: 'ep-sol-2',
    category: 'Solemnes y Clásicos',
    text: 'Con profunda admiración y respeto, honramos la memoria de quien supo sembrar solo bien a su paso.',
  },
  {
    id: 'ep-sol-3',
    category: 'Solemnes y Clásicos',
    text: 'El tiempo pasa, pero el ejemplo de una vida íntegra y fecunda permanece para la posteridad.',
  },
  {
    id: 'ep-sol-4',
    category: 'Solemnes y Clásicos',
    text: 'Dormita en el reposo reservado para las almas generosas y las conciencias serenas.',
  },
  {
    id: 'ep-sol-5',
    category: 'Solemnes y Clásicos',
    text: 'La dignidad de sus actos y la calidez de su espíritu son el legado que atesoramos con veneración.',
  },
  {
    id: 'ep-sol-6',
    category: 'Solemnes y Clásicos',
    text: 'Homenaje solemne a un ser humano extraordinario que cumplió con creces su misión terrenal.',
  },
  {
    id: 'ep-sol-7',
    category: 'Solemnes y Clásicos',
    text: 'Su partida deja un vacío irreemplazable, pero su nombre perdurará con gloria en nuestras memorias.',
  },
  {
    id: 'ep-sol-8',
    category: 'Solemnes y Clásicos',
    text: 'Con gratitud eterna por cada consejo sabio, cada sacrificio silencioso y cada muestra de lealtad.',
  },
  {
    id: 'ep-sol-9',
    category: 'Solemnes y Clásicos',
    text: 'Vivió con honor, amó con generosidad y partió dejando una huella indeleble en la sociedad.',
  },
  {
    id: 'ep-sol-10',
    category: 'Solemnes y Clásicos',
    text: 'En memoria de quien honró cada día de su existencia con entrega, lealtad y rectitud.',
  },

  // -------------------------------------------------------------
  // CATEGORÍA 3: RELIGIOSOS Y ESPIRITUALES (10)
  // -------------------------------------------------------------
  {
    id: 'ep-rel-1',
    category: 'Religiosos y Espirituales',
    text: '«El Señor es mi pastor, nada me faltará; en verdes praderas me hace reposar.» (Salmo 23)',
  },
  {
    id: 'ep-rel-2',
    category: 'Religiosos y Espirituales',
    text: '«Yo soy la resurrección y la vida; el que cree en mí, aunque esté muerto, vivirá.» (Juan 11:25)',
  },
  {
    id: 'ep-rel-3',
    category: 'Religiosos y Espirituales',
    text: 'Descansa en los brazos del Creador, donde no hay dolor ni llanto, solo paz y gozo eterno.',
  },
  {
    id: 'ep-rel-4',
    category: 'Religiosos y Espirituales',
    text: 'Dale, Señor, el descanso eterno, y brille para su alma la luz perpetua.',
  },
  {
    id: 'ep-rel-5',
    category: 'Religiosos y Espirituales',
    text: 'Dios te llamó a su lado porque contempló la pureza de tu corazón y la nobleza de tu fe.',
  },
  {
    id: 'ep-rel-6',
    category: 'Religiosos y Espirituales',
    text: 'Tu alma habita ya en el jardín celestial, intercediendo con amor por quienes aún peregrinamos.',
  },
  {
    id: 'ep-rel-7',
    category: 'Religiosos y Espirituales',
    text: '«He combatido el buen combate, he terminado la carrera, he guardado la fe.» (2 Timoteo 4:7)',
  },
  {
    id: 'ep-rel-8',
    category: 'Religiosos y Espirituales',
    text: 'Bajo el manto protector de la Virgen María y la misericordia divina, descansa en paz.',
  },
  {
    id: 'ep-rel-9',
    category: 'Religiosos y Espirituales',
    text: 'Bendito sea el recuerdo de tu fe inquebrantable, que iluminó siempre nuestro hogar en la oración.',
  },
  {
    id: 'ep-rel-10',
    category: 'Religiosos y Espirituales',
    text: 'El amor de Dios te recibe hoy con los brazos abiertos en la morada eterna del paraíso.',
  },

  // -------------------------------------------------------------
  // CATEGORÍA 4: INSPIRADORES Y POÉTICOS (10)
  // -------------------------------------------------------------
  {
    id: 'ep-po-1',
    category: 'Inspiradores y Poéticos',
    text: 'Aquellos a quienes verdaderamente amamos nunca mueren; simplemente se adelantan en el sendero de la luz.',
  },
  {
    id: 'ep-po-2',
    category: 'Inspiradores y Poéticos',
    text: 'Como una estrella brillante en la noche serena, tu presencia seguirá iluminando nuestro cielo.',
  },
  {
    id: 'ep-po-3',
    category: 'Inspiradores y Poéticos',
    text: 'No llores si me amas; si pudieras ver la belleza de la paz infinita en la que ahora descanso, sonreirías.',
    origin: 'San Agustín',
  },
  {
    id: 'ep-po-4',
    category: 'Inspiradores y Poéticos',
    text: 'Tu voz susurra en el viento suave, tu calor vive en el sol de cada mañana y tu bondad en cada latido.',
  },
  {
    id: 'ep-po-5',
    category: 'Inspiradores y Poéticos',
    text: 'La muerte no es apagar la luz; es solo encender la lámpara eterna porque el nuevo día ha comenzado.',
    origin: 'Rabindranath Tagore',
  },
  {
    id: 'ep-po-6',
    category: 'Inspiradores y Poéticos',
    text: 'Cierras los ojos en este mundo para despertar a la plenitud sin fin. Gracias por ser nuestra poesía de vida.',
  },
  {
    id: 'ep-po-7',
    category: 'Inspiradores y Poéticos',
    text: 'Dejaste el cuerpo terrenal, pero tus alas de libertad y amor nos abrazan desde el firmamento.',
  },
  {
    id: 'ep-po-8',
    category: 'Inspiradores y Poéticos',
    text: 'Un corazón que dio tanto amor jamás puede desaparecer: se transforma en la música eterna del recuerdo.',
  },
  {
    id: 'ep-po-9',
    category: 'Inspiradores y Poéticos',
    text: 'Hay seres que dejan una estela tan luminosa que su fulgor acompaña generaciones enteras.',
  },
  {
    id: 'ep-po-10',
    category: 'Inspiradores y Poéticos',
    text: 'El río de tu vida desemboca hoy en el inmenso mar de la paz. Gracias por cada instante compartido.',
  },

  // -------------------------------------------------------------
  // CATEGORÍA 5: FAMILIARES Y DE AMOR (10)
  // -------------------------------------------------------------
  {
    id: 'ep-fam-1',
    category: 'Familiares y de Amor',
    text: 'Pilar entrañable de nuestro hogar: gracias por amarnos incondicionalmente y enseñarnos a estar siempre unidos.',
  },
  {
    id: 'ep-fam-2',
    category: 'Familiares y de Amor',
    text: 'Tu amor infinito, tu tierna paciencia y tus bendiciones cotidianas vivirán por siempre en tus hijos y nietos.',
  },
  {
    id: 'ep-fam-3',
    category: 'Familiares y de Amor',
    text: 'Nos diste las raíces para crecer fuertes y las alas para soñar alto. Siempre serás nuestro mayor orgullo.',
  },
  {
    id: 'ep-fam-4',
    category: 'Familiares y de Amor',
    text: 'En cada reunión familiar, en cada sonrisa compartida y en cada plegaria, estarás presente entre nosotros.',
  },
  {
    id: 'ep-fam-5',
    category: 'Familiares y de Amor',
    text: 'A nuestra amada madre/abuela: tu ternura fue el mayor tesoro terrenal que la vida nos pudo regalar.',
  },
  {
    id: 'ep-fam-6',
    category: 'Familiares y de Amor',
    text: 'A nuestro amado padre/abuelo: tu trabajo incansable, tus palabras sabias y tu fortaleza guiarán nuestras vidas.',
  },
  {
    id: 'ep-fam-7',
    category: 'Familiares y de Amor',
    text: 'El amor conyugal y familiar que supiste forjar trasciende las barreras del tiempo y de la muerte.',
  },
  {
    id: 'ep-fam-8',
    category: 'Familiares y de Amor',
    text: 'Gracias por convertir cada rincón de nuestra casa en un remanso de alegría, paz y generosidad.',
  },
  {
    id: 'ep-fam-9',
    category: 'Familiares y de Amor',
    text: 'No decimos adiós, sino hasta luego, con la certeza de que tu amor nos aguarda en la casa del Padre.',
  },
  {
    id: 'ep-fam-10',
    category: 'Familiares y de Amor',
    text: 'Tu familia entera eleva hoy una oración en agradecimiento por haber tenido la dicha inmensa de tu compañía.',
  },
];

// Catálogo de plantillas de semblanzas / memorias con marcadores visuales
export const BIOGRAPHY_TEMPLATES: BiographyTemplateItem[] = [
  // -------------------------------------------------------------
  // PARA MADRES (3)
  // -------------------------------------------------------------
  {
    id: 'bio-mat-1',
    title: 'Madre Ejemplar y Pilar de Amor',
    category: 'Para Madres',
    description: 'Enfocada en el amor incondicional, la dedicación a los hijos y la unión familiar.',
    template: `Madre entrañable, bondadosa y pilar fundamental de nuestra familia. [Nombre] dedicó cada día de su vida a brindar amor incondicional, cuidado desinteresado y una palabra de aliento a sus hijos [Nombres de los hijos] y nietos. Su mayor orgullo fue ver a su familia unida, y su mesa siempre estuvo abierta con calidez para quien necesitara refugio o consuelo. Nos deja un legado imborrable de fortaleza, fe y dulzura que vivirá por siempre en cada una de nuestras memorias.`,
  },
  {
    id: 'bio-mat-2',
    title: 'Madre Trabajadora y Valiente',
    category: 'Para Madres',
    description: 'Resalta el esfuerzo incansable, la superación y los principios éticos transmitidos.',
    template: `Mujer admirable de inquebrantable fortaleza y noble corazón. A lo largo de sus [Años/décadas] de vida, [Nombre] supo enfrentar con gallardía cada desafío terrenal, trabajando incansablemente para brindar lo mejor a sus seres amados. Maestra de vida en el arte de la perseverancia y la rectitud moral, enseñó a sus descendientes que la mayor riqueza reside en la honradez y la generosidad. Su recuerdo florecerá eternamente en el corazón de su familia y amistades.`,
  },
  {
    id: 'bio-mat-3',
    title: 'Madre y Maestra de Vida',
    category: 'Para Madres',
    description: 'Para madres con vocación educativa, comunitaria o de profunda sensibilidad artística.',
    template: `Dotada de una sensibilidad humana única y un espíritu compasivo, [Nombre] iluminó la vida de quienes tuvieron el privilegio de conocerla. Madre ejemplar y [profesión o vocación, ej. maestra/enfermera/artesana], supo sembrar conocimiento, ternura y alegría en generaciones enteras. Sus consejos sabios, su risa contagiosa y su fe en el poder del amor serán la brújula que guiará a sus seres queridos por siempre.`,
  },

  // -------------------------------------------------------------
  // PARA PADRES (3)
  // -------------------------------------------------------------
  {
    id: 'bio-pat-1',
    title: 'Padre Noble, Íntegro y Protector',
    category: 'Para Padres',
    description: 'Enfocada en el ejemplo de honradez, protección familiar y consejo sabio.',
    template: `Hombre íntegro, padre devoto y amigo sincero. [Nombre] representó para su familia el faro seguro donde resguardarse ante las tormentas y la voz serena que brindaba el consejo justo en el momento oportuno. Esposo ejemplar de [Nombre del cónyuge] y padre orgulloso de [Nombres de los hijos], dedicó su existencia a inculcar el valor del trabajo honesto, la lealtad y el respeto hacia los demás. Su legado de rectitud permanecerá como el más valioso estandarte familiar.`,
  },
  {
    id: 'bio-pat-2',
    title: 'Padre Trabajador de Gran Corazón',
    category: 'Para Padres',
    description: 'Destaca la laboriosidad, el sentido del humor y el cariño hacia amigos y colegas.',
    template: `Trabajador incansable y forjador de su propio destino con manos firmes y corazón noble. [Nombre] se distinguió siempre por su generosidad sin límites, su disposición constante para auxiliar al prójimo y ese sentido del humor afable que alegraba cualquier sobremesa. Sus amigos y compañeros de [oficio/empresa/comunidad] le recordarán como un ser humano íntegro y solidario, mientras su familia atesorará eternamente sus abrazos cálidos y sus enseñanzas de vida.`,
  },
  {
    id: 'bio-pat-3',
    title: 'Patriarca Sabio y Mentor Familiar',
    category: 'Para Padres',
    description: 'Para un padre de edad venerable que fue guía y consejero de múltiples generaciones.',
    template: `Con profunda veneración y amor, recordamos a [Nombre], patriarca de nuestra estirpe y guía de generaciones. Hombre de profundas convicciones, memoria lúcida y generosidad sin aspavientos, supo guiar con mano firme y corazón compasivo a sus hijos, nietos y bisnietos. Cada anécdota compartida y cada principio forjado en su hogar constituyen la herencia viva que mantendremos encendida en su memoria.`,
  },

  // -------------------------------------------------------------
  // PARA ABUELOS Y ABUELAS (3)
  // -------------------------------------------------------------
  {
    id: 'bio-abu-1',
    title: 'Abuelita Querida: Ternura y Magia',
    category: 'Para Abuelos y Abuelas',
    description: 'Celebra la dulzura, los cuentos, las recetas y el amor infinito a los nietos.',
    template: `Nuestra entrañable [abuelita/tita], [Nombre], fue sinónimo de dulzura infinita, mimos sinceros y risas inolvidables. Sus nietos [Nombres de los nietos] siempre atesorarán las tardes compartidas, sus deliciosas comidas preparadas con amor y esos abrazos que curaban cualquier pena. Su casa siempre fue un templo de paz y alegría. Descansa en paz, querida abuela; tu ternura vivirá tatuada en nuestras almas.`,
  },
  {
    id: 'bio-abu-2',
    title: 'Abuelo Ejemplar: Sabiduría y Cariño',
    category: 'Para Abuelos y Abuelas',
    description: 'Para un abuelo consentidor, relator de historias y pilar entrañable de los más jóvenes.',
    template: `Abuelo noble, paciente y compañero entrañable de juegos y relatos fascinantes. [Nombre] enseñó a sus nietos y bisnietos el amor por las cosas sencillas de la vida, el valor de la gratitud y la importancia de sonreír ante cada amanecer. Sus ojos bondadosos y su corazón generoso permanecerán grabados en la memoria de toda su familia como símbolo del más puro y desinteresado afecto.`,
  },
  {
    id: 'bio-abu-3',
    title: 'Raíz Ancestral y Sabia Maestra',
    category: 'Para Abuelos y Abuelas',
    description: 'Reconocimiento a una larga vida de sacrificios y sabiduría ancestral compartida.',
    template: `Agradecemos a Dios la bendición inmensa de haber compartido [número] años junto a [Nombre]. Como raíz profunda de nuestro árbol genealógico, presenció el florecimiento de hijos, nietos y bisnietos, regando cada etapa con oraciones, bendiciones y sabiduría serena. Su paso por este mundo deja una estela de paz que el tiempo jamás podrá borrar.`,
  },

  // -------------------------------------------------------------
  // BREVES Y CLÁSICAS (3)
  // -------------------------------------------------------------
  {
    id: 'bio-br-1',
    title: 'Semblanza Breve Clásica',
    category: 'Breves y Clásicas',
    description: 'Concisa, solemne y adaptable a cualquier persona o circunstancia.',
    template: `Dedicó su vida a sembrar amor, bondad y rectitud entre quienes le rodearon. [Nombre] fue una persona entrañable cuya calidez humana, generosidad y alegría dejaron una marca imborrable en el corazón de su familia, amigos y de toda la comunidad que hoy honra con profundo respeto su memoria.`,
  },
  {
    id: 'bio-br-2',
    title: 'Homenaje a una Vida Plena',
    category: 'Breves y Clásicas',
    description: 'Resalta el agradecimiento de los deudos por los años compartidos.',
    template: `Celebrando una vida plena y fecunda, despedimos a [Nombre] con el corazón lleno de amor y gratitud por los hermosos momentos compartidos. Su recuerdo permanecerá intacto en cada enseñanza transmitida, en su sonrisa entrañable y en la paz que siempre supo transmitir.`,
  },
  {
    id: 'bio-br-3',
    title: 'Memoria Solemne y Afecto Fraterno',
    category: 'Breves y Clásicas',
    description: 'Elegante, solemne y sobria para homenajes institucionales o familiares.',
    template: `Con profundo pesar y cristiana esperanza, conmemoramos el eterno descanso de [Nombre]. Ser humano íntegro y generoso, cumplió con lealtad y rectitud su camino terrenal. Sus deudos elevan una oración por su alma en el descanso bienaventurado.`,
  },

  // -------------------------------------------------------------
  // VOCACIÓN Y SERVICIO / PROFESIONALES (3)
  // -------------------------------------------------------------
  {
    id: 'bio-voc-1',
    title: 'Vocación de Servicio y Entrega Comunitaria',
    category: 'Vocación y Servicio',
    description: 'Para personas dedicadas a la salud, educación, ayuda humanitaria o voluntariado.',
    template: `Alma noble de profunda vocación de servicio, [Nombre] entendió que la grandeza de la vida radica en darse a los demás. Como [profesión/oficio, ej. médico, educador, voluntario], tocó las vidas de innumerables personas con empatía, desvelo y dedicación desinteresada. Su partida física deja un legado ético y comunitario que inspirará a futuras generaciones a continuar su sendero de bondad.`,
  },
  {
    id: 'bio-voc-2',
    title: 'Profesional Ejemplar y Compañero Leal',
    category: 'Vocación y Servicio',
    description: 'Destaca la trayectoria profesional, la mentoría a colegas y la excelencia.',
    template: `Distinguido por su profesionalismo intachable, su brillante lucidez y su calidad humana insuperable. Durante más de [años] años de trayectoria en [área o empresa], [Nombre] fue mentor generoso de jóvenes talentos y compañero solidario ante las adversidades. Sus colegas y amigos admiran en él al profesional riguroso y, por encima de todo, al ser humano compasivo y digno.`,
  },
  {
    id: 'bio-voc-3',
    title: 'Paz, Arte y Creatividad',
    category: 'Vocación y Servicio',
    description: 'Para artistas, músicos, amantes de la naturaleza o la cultura.',
    template: `Espíritu libre, sensible y apasionado por [el arte / la música / la naturaleza / el deporte]. [Nombre] supo descubrir y compartir la belleza en los detalles más cotidianos de la existencia. Nos enseñó a amar intensamente, a disfrutar cada instante y a celebrar la vida con optimismo inquebrantable. Su melodía continuará resonando en nuestros corazones por siempre.`,
  },

  // -------------------------------------------------------------
  // GENERALES Y FAMILIARES (3)
  // -------------------------------------------------------------
  {
    id: 'bio-gen-1',
    title: 'Unión Familiar y Amistad Leal',
    category: 'Generales y Familiares',
    description: 'Para personas que fueron el alma de las reuniones familiares y amigos incondicionales.',
    template: `Persona alegre, generosa y amigable por naturaleza. [Nombre] poseía el don especial de hacer sentir bienvenido a todo aquel que cruzara por su puerta. Su amor incondicional hacia su familia [Familia / Apellidos] y su lealtad infinita hacia sus amistades hicieron de su vida una fiesta continua de afecto, solidaridad y camaradería.`,
  },
  {
    id: 'bio-gen-2',
    title: 'Fe Profunda y Caridad Cristiana',
    category: 'Generales y Familiares',
    description: 'Enfocada en la devoción espiritual, la oración y la esperanza en la vida eterna.',
    template: `Fiel creyente y testigo vivo de la caridad cristiana. [Nombre] iluminó su hogar con la luz del Evangelio, la devoción diaria y el consuelo constante hacia los más desfavorecidos. Enfrentó cada etapa terrenal con paciencia admirable y serena esperanza. Hoy descansa en la dicha de contemplar cara a cara al Señor a quien tanto amó.`,
  },
  {
    id: 'bio-gen-3',
    title: 'Juventud, Alegría y Recuerdo Eterno',
    category: 'Generales y Familiares',
    description: 'Para personas jóvenes cuya luz y sonrisa marcaron con intensidad a su entorno.',
    template: `Luz resplandeciente, sonrisa franca y entusiasmo contagioso. En su paso por nuestras vidas, [Nombre] nos regaló lecciones imborrables de bondad, pasión por vivir y autenticidad sin límites. Aunque su partida nos colma de dolor, damos gracias por haber tenido el inmenso privilegio de caminar a su lado y atesorar su recuerdo como un faro eterno de inspiración.`,
  },
];
