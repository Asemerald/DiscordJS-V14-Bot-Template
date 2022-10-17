const { EmbedBuilder, ApplicationCommandOptionType  } = require('discord.js');
const request = require('postman-request');
const config = require('../../../config/config.js');
const { memeCommandDataTemplate } = require('../../../memes/meme.js');

//Pick a template from https://api.imgflip.com/get_memes and edit it then send it to the user
module.exports = {
    name: 'meme',
    description: 'Sends a meme',
    type: 1,
    options: [
        {
            name: "",
            description: "",
            value: "",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "",
                    description: "",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "",
                    description: "",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                }
            ]
        },
        {
            name: "batman",
            description: "Fait un meme avec Batman qui tape Robin",
            value: "438680",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "texte-1",
                    description: "Ce que dit Robin",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "texte-2",
                    description: "Ce que dit / qui est Batman",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                }
            ]
        },
        {
            name: "ballon",
            description: "Fait un meme avec un mec qui empeche un autre de prendre son ballon",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'texte-1',
                    description: 'La légende du mec principal qui attrape le ballon',
                    type: 3,
                    required: true
                },
                {
                    name: 'texte-2',
                    description: 'La légende du ballon',
                    type: 3,
                    required: true
                },
                {
                    name: 'texte-3',
                    description: 'La légende du mec qui empeche le mec principal d\'attraper le ballon',
                    type: 3,
                    required: true
                },
            ]
        },
        {
            name: "spongebob",
            description: "Fait un meme avec Spongebob",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "texte-1",
                    description: "Le texte du haut",
                    required: true,
                    type: 3,
                },
                {
                    name: "texte-2",
                    description: "Le texte du bas",
                    required: false,
                    type: ApplicationCommandOptionType.String
                }
            ]
        }
    ],
    permissions: {
        DEFAULT_MEMBER_PERMISSIONS: 'SendMessages'
    },



//RUN THE COMMAND

    run: async (client, interaction, config, db) => {
        const text0 = interaction.options.getString('texte-1');
        const text1 = interaction.options.getString('texte-2');
        const text2 = interaction.options.getString('texte-3');
        const memeData = require('../../../memes/drake.json');

            if (interaction.options.getSubcommand() === "drake") {

                const meme = memeCommandDataTemplate
                meme.template_id = memeData.value
                console.log(meme.template_id) ;


            //TEMPLATE DE DRAKE


                let template = "181913649";
        if (!template) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder() //If no template is specified, send an error message
                        .setTitle('Error')
                        .setDescription('You need to specify a template!')
                ],
                ephemeral: true
            });
        }

        request.post( //Send a request to the imgflip api to caption the image
            {
                url: 'https://api.imgflip.com/caption_image',
                form: {
                    template_id: template,
                    username: config.Imgflip.USERNAME,
                    password: config.Imgflip.PASSWORD,
                    text0: text0,
                    text1: text1
                }
            },
           
            (error, response, body) => {
                if (error) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If there is an error, send it to the user
                                .setTitle('Erreur')
                                .setDescription('jsp ce que t\'as fait mais t\'as tout cassé')
                        ],
                        ephemeral: true
                    });
                }

                const data = JSON.parse(body);

                if (!data.success) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If the request failed, send an error message
                                .setTitle('Erreur')
                                .setDescription(`Une erreur est survenue: ${data.error_message}`)
                                .setColor('#ED4245')
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Voici ton meme bg')  //Send the meme to the user
                            .setImage(data.data.url)
                    ],
                    ephemeral: true

                });
            }
        );
    } else if (interaction.options.getSubcommand() === "batman") {

        //TEMPLATE DE BATMAN QUI TAPE ROBIN


        let template = "438680";
        if (!template) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder() //If no template is specified, send an error message
                        .setTitle('Error')
                        .setDescription('You need to specify a template!')
                ],
                ephemeral: true
            });
        }

        request.post( //Send a request to the imgflip api to caption the image
            {
                url: 'https://api.imgflip.com/caption_image',
                form: {
                    template_id: template,
                    username: config.Imgflip.USERNAME,
                    password: config.Imgflip.PASSWORD,
                    text0: text0,
                    text1: text1
                }
            },
           
            (error, response, body) => {
                if (error) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If there is an error, send it to the user
                                .setTitle('Erreur')
                                .setDescription('jsp ce que t\'as fait mais t\'as tout cassé')
                        ],
                        ephemeral: true
                    });
                }

                const data = JSON.parse(body);

                if (!data.success) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If the request failed, send an error message
                                .setTitle('Erreur')
                                .setDescription(`Une erreur est survenue: ${data.error_message}`)
                                .setColor('#ED4245')
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Voici ton meme bg')  //Send the meme to the user
                            .setImage(data.data.url)
                    ],
                    ephemeral: true

                });
            }
        );
    } else if (interaction.options.getSubcommand() === "ballon") {


        //TEMPLATE DU MEME BALLON


        let template = "131087935";
        if (!template) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder() //If no template is specified, send an error message
                        .setTitle('Error')
                        .setDescription('Jsp comment t\'as fait mais t\'as réussi à faire une erreur en faisant une commande qui envoie un meme')
                        .setColor('Red')
                ],
                ephemeral: true
            });
        }

        request.post( //Send a request to the imgflip api to caption the image with boxes
            {
                url: 'https://api.imgflip.com/caption_image', //Imgflip api url
                form: {
                    template_id: template,
                    username: config.Imgflip.USERNAME,
                    password: config.Imgflip.PASSWORD,     //Add text to custom boxes
                    boxes: [
                        {
                            "text": `${text0}`,
                            "x": 75,
                            "y": 300,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text1}`,	
                            "x": 550,
                            "y": 150,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text2}`,	
                            "x": 30,
                            "y": 620,
                            "width": 250,
                            "height": 250,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text0}`,	
                            "x": 275,
                            "y": 850,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text1}`,	
                            "x": 600,
                            "y": 600,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        }
                    ]
                }
            },     
            (error, response, body) => {
                if (error) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If there is an error, send it to the user
                                .setTitle('Erreur')
                                .setDescription('jsp ce que t\'as fait mais t\'as tout cassé')
                        ],
                        ephemeral: true
                    });
                }

                const data = JSON.parse(body);

                if (!data.success) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If the request failed, send an error message
                                .setTitle('Erreur')
                                .setDescription(`Une erreur est survenue: ${data.error_message}`)
                                .setColor('#ED4245')
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Voici ton meme bg')  //Send the meme to the user
                            .setImage(data.data.url)
                    ],
                    ephemeral: true

                });
            }
        );
    } else if (interaction.options.getSubcommand() === "spongebob") {

        //TEMPLATE SPONGEBOB


        let template = "102156234";
        if (!template) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder() //If no template is specified, send an error message
                        .setTitle('Error')
                        .setDescription('Jsp comment t\'as fait mais t\'as réussi à faire une erreur en faisant une commande qui envoie un meme')
                        .setColor('Red')
                ],
                ephemeral: true
            });
        }
    
        request.post( //Send a request to the imgflip api to caption the image with boxes
            {
                url: 'https://api.imgflip.com/caption_image', //Imgflip api url
                form: {
                    template_id: template,
                    username: config.Imgflip.USERNAME,
                    password: config.Imgflip.PASSWORD,     //Add text to custom boxes
                    text0: text0,
                    text1: text1
                                    }
            },
           
            (error, response, body) => {
                if (error) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If there is an error, send it to the user
                                .setTitle('Erreur')
                                .setDescription('jsp ce que t\'as fait mais t\'as tout cassé')
                        ],
                        ephemeral: true
                    });
                }

                const data = JSON.parse(body);

                if (!data.success) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If the request failed, send an error message
                                .setTitle('Erreur')
                                .setDescription(`Une erreur est survenue: ${data.error_message}`)
                                .setColor('#ED4245')
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Voici ton meme bg')  //Send the meme to the user
                            .setImage(data.data.url)
                    ],
                    ephemeral: true

                });
            }
        );
    }}
}

