interface CardBase {
  title: string,
  description: string,
  category: Category,
  points: number
}

enum Category {
  HISTORICAL_FIGURE = 'Historical Figure',
  CELEBRITY = 'Celebrity',
  FICTIONAL_CHARACTER ='Fictional Character',
  ET_CETERA = 'Et Cetera',
}

const Cards: Array<CardBase> = [
  {
    title: 'Doge',
    description: "An internet meme that shows a Shiba Inu surrounded by colorful Comic Sans text that describes its inner monologue, such as \"Wow\", \"Concern\", and \"so scare.\" There is much confuse over the name's pronunciation, yet it was recetnyl used to brand a Bitcoin competitor.",
    category: Category.CELEBRITY,
    points: 3,
  },
  {
    title: 'A Russian Nesting Doll',
    description: "An internet meme that shows a Shiba Inu surrounded by colorful Comic Sans text that describes its inner monologue, such as \"Wow\", \"Concern\", and \"so scare.\" There is much confuse over the name's pronunciation, yet it was recetnyl used to brand a Bitcoin competitor.",
    category: Category.CELEBRITY,
    points: 3,
  },
  {
    title: 'Rick Santorum',
    description: 'The former Republican Senator whose name, in retribution for comparing homosexuality to beastiality, was redefined in a contest held by sex columnist Dan Savage as "the frothy mixture of lube and fecal matter that is sometimes the byproduct of anal sex."',
    category: Category.CELEBRITY,
    points: 2,
  },
  {
    title: 'Blacula',
    description: 'The title character from a horror film about an 18th century African prince turned vampire. Locked in a coffin for two centuries by Count Dracula, the box was purchased as part of an estate by two interior decoratess who accidentally set him loose in 70s Los Angeles.',
    category: Category.FICTIONAL_CHARACTER,
    points: 4,
  },
  {
    title: "Georgia O'Keeffe",
    description: 'An American modernist painter whose work was inspired by the New Mexico landscape surrounding her home. She is perhaps most famous for the uncanny resemblence of her painted flowers to female genitalia, though she denied any similarity.',
    category: Category.HISTORICAL_FIGURE,
    points: 2,
  },
  {
    title: 'Ebola',
    description: 'A virus that causes hemorrhagic fever, typically acquired by contact with an infected monkey, fruit bat, or person. Its most severe symptoms can include bleeding from the eyes, nose, ears, mount, and rectum. There is no specific treatement for the disease',
    category: Category.ET_CETERA,
    points: 2,
  },
  {
    title: 'A Furry',
    description: 'A person who wears a full body animal suit, often for conventions, roleplaying, or personal recreation. Their use in sexual activity is a controversial topic in the community. In a recent survey, 37% reported that it was an important part of their interest in the activity.',
    category: Category.ET_CETERA,
    points: 3,
  },
  {
    title: 'Gallagher',
    description: 'A prop comic famous for smashing watermelons with his trademark Sledge-O-Matic. He once sued his brother for touring under the comedian\'s name and walked out of a Marc Maron interview when asked about the use of racist, homophobic, and xenophobic slurs in his act.',
    category: Category.CELEBRITY,
    points: 1,
  },
  {
    title: 'Kobayashi',
    description: 'A Japanese competitive eater who shocked the world in 2001 by eating 50 hot dogs and buns (HDB) in 12 minutes at Nathan\'s Hot Dog Eating Contest, doubling the previous record. He once lost a hot dog eating contest (no buns) to a 1089 lb. Kodiak bear (31-50).',
    category: Category.CELEBRITY,
    points: 2,
  },
  {
    title: 'Flying Spaghetti Monster',
    description: 'The deity of Pastafarianism, a parody religion opposing intelligent design. A contemporary version of Russell\'s teapot, it is portrayed as a clump of pasta and meatballs with two eye stalks. It often appears touching Adam\'s finger in Michelangelo\'s Sistine Chapel ceiling painting.',
    category: Category.FICTIONAL_CHARACTER,
    points: 3,
  },
  {
    title: 'Sylvia Plath',
    description: 'Poet, author, and wife of Ted Hughes, who was known for her confessional style of poetry as well as her novel The Bell Jar. She had a history of depression, leading to her suicide at 30 from carbon monoxide poisoning after sticking her head into an unlit oven.',
    category: Category.HISTORICAL_FIGURE,
    points: 2,
  },
  {
    title: 'The Unabomber (Ted Kacyznski)',
    description: 'A terrorist math professor, who sent explosive packages through the mail. When Penthouse offered to publish his manifesto, Industrial Societ and its Future, he asked to reserve the right to plant one more bomb, since the managize was less "respectable" than others he solicited',
    category: Category.CELEBRITY,
    points: 2,
  },
  {
    title: 'Pablo Escobar',
    description: 'A Columbian drug lord and "King of Cocaine" who at his peak trafficked 15 tons of the drug into the US per yuear. He was kiled by authorities in a firefight in Medelin. According to a recent BBC report, a number of hippos from his menagerie still roam the Colombian countryside.',
    category: Category.HISTORICAL_FIGURE,
    points: 3,
  },
  {
    title: 'El Chupacabra',
    description: 'Literally "goat sucker", this legendary American cryptid is often described as a reptile-like creature that attacks and drinks the blood of sheep and other livestock. Most supposed sightings have been attributed to dogs or wolves afflicted by the skin disease mange.',
    category: Category.ET_CETERA,
    points: 4,
  },
  {
    title: 'Bill Cosby',
    description: 'One of the most famous comedians of all time. He created Fat Albert and played Cliff Huxtable on the show bearing his name. He is known for wearing sweaters, eating "Puddin\' Pops," and blaming much of the black incarceration rate on poor parenting.',
    category: Category.CELEBRITY,
    points: 1,
  },
  {
    title: 'Bob Fosse',
    description: 'A dancer and choreographer, who created musicals like ALl That Jazz and Cabaret. His style included turned-in knees, bowler hats, canes, and copious use of jazz hands - a technique where the performer\s hands are shown palms open to the audience with fingers splayed wide.',
    category: Category.HISTORICAL_FIGURE,
    points: 3,
  },
  {
    title: 'Heisenberg',
    description: 'A German theoretical physicist, creator of the uncertainty principle, and winner of a Nobel Prize in Physics for his development of quantum mechanics. His name was also used as an alias for the meth manufacturer Walter White in the series Breaking Bad.',
    category: Category.HISTORICAL_FIGURE,
    points: 2,
  },
];

export default Cards;
