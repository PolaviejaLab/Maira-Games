
target_directory = '../tiles/sand/';

cfg.c1 = [231 223 194] / 256;
cfg.c2 = [231 223 194] / 512 + [201 152 105] / 512;

target_size = [70 70];
phase = 0;
wave_water_level = 0;
wave_amplitude = 0;
wave_band_size = 70;

% Size of tiles / images
tile_size = 4 * target_size;
image_size = [2 1] .* tile_size;

A = waves(image_size, ...
            tile_size, ...
            phase, ...
            wave_water_level, ...
            wave_amplitude, ...
            wave_band_size, cfg);

ATop = A(1:280, :, :);
ATop = imresize(ATop, target_size, 'bicubic', 'AntiAliasing', true);

imwrite(ATop, fullfile(target_directory, 'sand_liquid.png'));
