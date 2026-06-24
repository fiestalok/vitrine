export interface VilleData {
  slug: string;
  nom: string;
  departement: '67' | '68';
  intro: string;
  zonesProches: string[];
  faq: Array<{ q: string; a: string }>;
  metaDescription: string;
}

export const VILLES: VilleData[] = [
  {
    slug: 'strasbourg',
    nom: 'Strasbourg',
    departement: '67',
    intro:
      "Hoplalo'K est basée à Strasbourg et livre dans toute la ville : Neudorf, Hautepierre, Meinau, Robertsau, Cronenbourg, Elsau, Montagne Verte… Que vous organisiez un anniversaire dans votre jardin ou une fête de quartier, notre équipe livre, installe et récupère le matériel en toute sérénité.",
    zonesProches: [
      'Schiltigheim', 'Bischheim', 'Hoenheim', 'Illkirch-Graffenstaden',
      'Ostwald', 'Lingolsheim', 'La Wantzenau', 'Souffelweyersheim',
    ],
    faq: [
      {
        q: 'Livrez-vous dans tous les quartiers de Strasbourg ?',
        a: "Oui, nous livrons partout à Strasbourg : Neudorf, Hautepierre, Meinau, Robertsau, Cronenbourg, Elsau, Montagne Verte et tous les autres quartiers de la ville.",
      },
      {
        q: 'Proposez-vous la livraison le week-end à Strasbourg ?',
        a: 'Oui, nous livrons 7j/7 de 8h à 20h, y compris le samedi et le dimanche.',
      },
      {
        q: 'Quel délai pour réserver un château gonflable à Strasbourg ?',
        a: "Nous recommandons de réserver au moins 2 semaines à l'avance, notamment pour les week-ends de printemps et d'été qui se remplissent rapidement.",
      },
      {
        q: 'Proposez-vous un photobooth à Strasbourg ?',
        a: "Oui, notre photobooth est disponible à la location à Strasbourg pour anniversaires, mariages, fêtes d'entreprise et événements associatifs.",
      },
    ],
    metaDescription:
      "Location château gonflable à Strasbourg — Hoplalo'K livre dans tous les quartiers. Photobooths, machines à pop-corn, enceintes. Devis gratuit.",
  },
  {
    slug: 'schiltigheim',
    nom: 'Schiltigheim',
    departement: '67',
    intro:
      "Schiltigheim, limitrophe du nord de Strasbourg, est l'une de nos zones de livraison les plus actives. Anniversaires, fêtes de voisins, événements associatifs… nous intervenons dans toute la ville et les communes voisines comme Bischheim, Hoenheim et Souffelweyersheim.",
    zonesProches: [
      'Bischheim', 'Hoenheim', 'Souffelweyersheim',
      'Strasbourg (nord)', 'Lampertheim', 'Mundolsheim',
    ],
    faq: [
      {
        q: 'Livrez-vous à Schiltigheim ?',
        a: "Oui, Schiltigheim fait partie de nos zones de livraison prioritaires. Nous livrons aussi dans les communes voisines : Bischheim, Hoenheim, Souffelweyersheim.",
      },
      {
        q: 'Peut-on louer un photobooth à Schiltigheim ?',
        a: "Oui, notre photobooth est disponible à Schiltigheim pour anniversaires, mariages et événements d'entreprise.",
      },
      {
        q: 'Y a-t-il un surcoût de livraison pour Schiltigheim ?',
        a: "Non, la livraison à Schiltigheim et dans l'Eurométropole de Strasbourg est incluse dans nos tarifs standards.",
      },
    ],
    metaDescription:
      "Location château gonflable à Schiltigheim — Hoplalo'K livre sans surcoût. Photobooths, machines à pop-corn, enceintes. Devis gratuit en ligne.",
  },
  {
    slug: 'illkirch',
    nom: 'Illkirch-Graffenstaden',
    departement: '67',
    intro:
      "Au sud de Strasbourg, Illkirch-Graffenstaden est une commune familiale où nous intervenons régulièrement pour des anniversaires d'enfants, des kermesses scolaires et des fêtes de voisinage. Nous couvrons aussi Ostwald, Geispolsheim, Lingolsheim et toute la rive gauche de l'Ill.",
    zonesProches: [
      'Ostwald', 'Lingolsheim', 'Geispolsheim',
      'Strasbourg (sud)', 'Eschau', 'Fegersheim',
    ],
    faq: [
      {
        q: 'Livrez-vous à Illkirch-Graffenstaden ?',
        a: "Oui, Illkirch-Graffenstaden et les communes du sud de Strasbourg (Ostwald, Lingolsheim, Geispolsheim) font partie de nos zones de livraison sans surcoût.",
      },
      {
        q: "Pouvez-vous installer un château gonflable dans une école à Illkirch ?",
        a: "Oui, nous intervenons pour les kermesses scolaires à Illkirch et dans tout le Bas-Rhin. Contactez-nous pour un devis adapté.",
      },
      {
        q: "Quel est le délai de montage d'un château gonflable à Illkirch ?",
        a: "Comptez environ 30 minutes pour l'installation. Nous arrivons à l'heure convenue et vérifions la sécurité du matériel avant de partir.",
      },
    ],
    metaDescription:
      "Location château gonflable à Illkirch-Graffenstaden — Hoplalo'K livre au sud de Strasbourg. Photobooths, pop-corn, enceintes. Devis gratuit.",
  },
  {
    slug: 'haguenau',
    nom: 'Haguenau',
    departement: '67',
    intro:
      "Deuxième ville du Bas-Rhin, Haguenau est une commune dynamique que nous couvrons régulièrement. Que vous organisiez une fête d'anniversaire, une fête patronale ou un événement d'entreprise, notre équipe livre et installe votre matériel festif à domicile.",
    zonesProches: [
      'Bischwiller', 'Brumath', 'Schweighouse-sur-Moder',
      'Batzendorf', 'Kaltenhouse', 'Marienthal',
    ],
    faq: [
      {
        q: 'Livrez-vous à Haguenau ?',
        a: "Oui, nous livrons à Haguenau et dans le nord du Bas-Rhin : Bischwiller, Brumath, Schweighouse-sur-Moder et les environs.",
      },
      {
        q: 'Proposez-vous une location de sono pour un événement à Haguenau ?',
        a: "Oui, nos enceintes sono sont disponibles à la location pour tous types d'événements à Haguenau et dans le Bas-Rhin.",
      },
      {
        q: 'Quel est le prix de la livraison à Haguenau ?',
        a: "Contactez-nous pour un devis personnalisé. La livraison est incluse dans nos tarifs standards pour la grande majorité de nos zones.",
      },
    ],
    metaDescription:
      "Location château gonflable à Haguenau — Hoplalo'K livre dans le nord du Bas-Rhin. Photobooths, machines à pop-corn, enceintes. Devis gratuit.",
  },
  {
    slug: 'colmar',
    nom: 'Colmar',
    departement: '68',
    intro:
      "Capitale des vins d'Alsace, Colmar accueille de nombreux événements festifs tout au long de l'année. Hoplalo'K livre à Colmar et dans le Haut-Rhin pour vos fêtes de famille, anniversaires d'enfants et événements associatifs. Nous couvrons Colmar et les communes voisines comme Wintzenheim, Ingersheim et Turckheim.",
    zonesProches: [
      'Wintzenheim', 'Ingersheim', 'Turckheim',
      'Houssen', 'Sainte-Croix-en-Plaine', 'Rouffach',
    ],
    faq: [
      {
        q: 'Livrez-vous à Colmar ?',
        a: "Oui, nous livrons à Colmar et dans le Haut-Rhin. Contactez-nous pour confirmer la disponibilité selon votre commune exacte.",
      },
      {
        q: 'Peut-on louer un château gonflable pour un événement à Colmar ?',
        a: "Oui, châteaux gonflables, photobooths, machines à pop-corn et enceintes sont disponibles à Colmar pour vos fêtes et événements.",
      },
      {
        q: 'Le prix de livraison est-il différent pour Colmar ?',
        a: "Un éventuel surcoût de transport peut s'appliquer selon la distance. Demandez un devis gratuit pour connaître les conditions exactes.",
      },
    ],
    metaDescription:
      "Location château gonflable à Colmar — Hoplalo'K livre dans le Haut-Rhin. Photobooths, machines à pop-corn, enceintes. Devis gratuit.",
  },
];
