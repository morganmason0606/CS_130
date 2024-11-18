const theme = {
    colors: {
        aqua: '#9ABFCA',
        black: '#0E0E0E',
        grey: '#EDEDED',
        white: '#FFFFFF',
    },
    links: {    // TODO: Are these the right colors for hover and active?
        dark: {
            default: '#0E0E0E',
            hover: '#0028FF',
            // active: '#FF0000',
        },
        light: {
            default: '#F8F8F8',
            hover: '#6C848C',
            // active: '#0E0E0E',
        },
    },
    fontSizes: {
        smaller: 12,
        small: 14,
        regular: 18,
        large: 24,
        larger: 36,
    },
    fontWeights: {
        regular: '400',
        bold: '700',
        bolder: '900',
    },
    // paddings: {
    //     small: 5,
    //     regular: 10,
    //     medium: 15,
    //     large: 20,
    // },
    error: {                // TODO: Keep or remove? So far only used in Login page.
        color: 'red',
        marginBottom: 6,
        fontSize: 14,       // Small font size for error messages
    },
    required: {             // TODO: Keep or remove? So far only used in Login page.
        color: 'red',
    },
}

export default theme;