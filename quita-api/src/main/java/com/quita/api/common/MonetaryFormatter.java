package com.quita.api.common;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class MonetaryFormatter {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    public static String formatBRL(BigDecimal value) {
        if (value == null) {
            return "R$ 0,00";
        }
        NumberFormat nf = NumberFormat.getCurrencyInstance(PT_BR);
        String formatted = nf.format(value);
        return formatted.replace("\u00A0", " ").trim();
    }
}
