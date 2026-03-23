package com.yong.yonghealth.global.util;

import com.yong.yonghealth.domain.WeightUnit;

public final class WeightConverter {

    private static final double KG_TO_LB = 2.20462;

    private WeightConverter() {
    }

    public static double convert(double value, WeightUnit from, WeightUnit to) {
        if (from == to) {
            return value;
        }
        return from == WeightUnit.KG
                ? Math.round(value * KG_TO_LB * 100.0) / 100.0
                : Math.round(value / KG_TO_LB * 100.0) / 100.0;
    }
}
