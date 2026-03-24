package com.yong.yonghealth.global.util;

import com.yong.yonghealth.domain.WeightUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeightConverterTest {

    @Test
    @DisplayName("KG에서 LB로 변환한다")
    void kgToLb() {
        double result = WeightConverter.convert(100, WeightUnit.KG, WeightUnit.LB);
        assertThat(result).isEqualTo(220.46);
    }

    @Test
    @DisplayName("LB에서 KG으로 변환한다")
    void lbToKg() {
        double result = WeightConverter.convert(220.46, WeightUnit.LB, WeightUnit.KG);
        assertThat(result).isEqualTo(100.0);
    }

    @Test
    @DisplayName("동일 단위 변환 시 값이 그대로 반환된다")
    void sameUnit() {
        assertThat(WeightConverter.convert(60.0, WeightUnit.KG, WeightUnit.KG)).isEqualTo(60.0);
        assertThat(WeightConverter.convert(132.28, WeightUnit.LB, WeightUnit.LB)).isEqualTo(132.28);
    }

    @Test
    @DisplayName("0 변환 시 0이 반환된다")
    void zeroValue() {
        assertThat(WeightConverter.convert(0, WeightUnit.KG, WeightUnit.LB)).isEqualTo(0.0);
        assertThat(WeightConverter.convert(0, WeightUnit.LB, WeightUnit.KG)).isEqualTo(0.0);
    }
}
